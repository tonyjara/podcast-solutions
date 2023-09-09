import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { encode } from "gpt-tokenizer";
import { systemMessage } from "@/lib/Constants";
import { TRPCError } from "@trpc/server";
import { checkIfTrialHasEnoughChatCredits } from "./routeUtils/freeTrialUtils";
import { handleChatModel } from "./routeUtils/ChatRouteUtils";
import Decimal from "decimal.js";
import { saveChatUsageToDb } from "./routeUtils/CreditsUsageUtils";
import { postChatUsageToStripe } from "./routeUtils/PostStripeUsageUtils";
import { handleCreditUsageCalculation } from "./routeUtils/StripeUsageUtils";
import { SubscriptionCreditsActions } from "@prisma/client";

export interface MessageSchema {
    role: "assistant" | "user" | "system";
    content: string;
}
export interface ChatResponse {
    index: number;
    message: MessageSchema;
    finish_reason: string;
}

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const chatGPTRouter = createTRPCRouter({
    storeEpisodeChat: protectedProcedure
        .input(
            z.object({
                role: z.string().min(1),
                content: z.string().min(1),
                episodeId: z.string().min(1),
            }),
        )
        .mutation(async ({ input }) => {
            await prisma.episodeChat.create({
                data: {
                    role: input.role,
                    content: input.content,
                    episodeId: input.episodeId,
                },
            });
        }),
    getEpidodeChat: protectedProcedure
        .input(z.object({ episodeId: z.string().optional() }))
        .query(async ({ input }) => {
            if (!input.episodeId) {
                return [];
            }
            const chat = await prisma.episodeChat.findMany({
                where: {
                    episodeId: input.episodeId,
                },
            });
            return chat.map((x) => ({
                role: x.role,
                content: x.content,
            }));
        }),

    chatInEpisode: protectedProcedure
        .input(
            z.object({
                episodeId: z.string().min(1),
                userContent: z.string().min(1),
                messages: z.array(
                    z.object({ role: z.string().min(1), content: z.string().min(1) }),
                ),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            // 1. If subscription is trial, then check credits, reject when not sufficient
            // 2. Get chat completion
            // 3. Save chat completion to db
            // 4. Execute stripe and db usage handler

            const subscription = await prisma.subscription.findUniqueOrThrow({
                where: { userId: ctx.session.user.id },
                include: { subscriptionItems: true },
            });

            const tokenCountAverage = encode(input.userContent).length;
            const model = handleChatModel(tokenCountAverage);
            //1,
            const lastChatActions = await checkIfTrialHasEnoughChatCredits({
                tokenCountAverage,
                subscription,
                outputCutoff: 500,
            });

            //2.
            const chatCompletion = await openai.createChatCompletion({
                model,
                messages: [
                    systemMessage,
                    ...(input.messages as ChatCompletionRequestMessage[]),
                    { role: "user", content: input.userContent },
                ],
            });

            const response = chatCompletion.data.choices[0]?.message;
            if (!response?.content) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "No response generated",
                });
            }

            //3.
            await prisma.episodeChat.create({
                data: {
                    role: "user",
                    content: input.userContent,
                    episodeId: input.episodeId,
                },
            });
            await prisma.episodeChat.create({
                data: {
                    role: "assistant",
                    content: response.content,
                    episodeId: input.episodeId,
                },
            });

            //4.
            const inputTokens = chatCompletion.data.usage?.prompt_tokens || 0;
            const outputTokens = chatCompletion.data.usage?.completion_tokens || 0;
            const { lastChatOuputAction, lastChatInputAction } = lastChatActions;
            await postChatInputAndOutputToStripeAndDb({
                subscription,
                inputTokens,
                outputTokens,
                lastChatInputAction,
                lastChatOuputAction,
            });

            return { role: response.role, content: response.content };
        }),
    clearEpisodeChat: protectedProcedure
        .input(z.object({ episodeId: z.string().min(1) }))
        .mutation(async ({ input }) => {
            await prisma.episodeChat.deleteMany({
                where: {
                    episodeId: input.episodeId,
                },
            });
        }),
    generateShowNotesFromTranscription: protectedProcedure
        .input(
            z.object({
                episodeId: z.string().min(1),
                transcription: z.string().min(1),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            // 1. If subscription is trial, then check credits, reject when not sufficient
            // 2. Get chat completion
            // 3. Save chat completion to db
            // 4. Execute stripe and db usage handler
            const subscription = await prisma.subscription.findUniqueOrThrow({
                where: { userId: ctx.session.user.id },
                include: { subscriptionItems: true },
            });

            //1.
            const tokenCountAverage = encode(input.transcription).length;
            const model = handleChatModel(tokenCountAverage);
            const lastChatActions = await checkIfTrialHasEnoughChatCredits({
                tokenCountAverage,
                subscription,
                outputCutoff: 1000,
            });

            //2.

            const content = `Using this podcast transcription, auto detect the language and generate show notes that reflect the transcription content, similar to what podcasts have.  Return only the show notes in HTML format. The show notes should be in the same language as the transcription. Here's the transcript: "${input.transcription}" `;

            const chatCompletion = await openai.createChatCompletion({
                model,
                messages: [systemMessage, { role: "user", content }],
            });

            const showNotes = chatCompletion.data.choices[0]?.message;
            if (!showNotes) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "No show notes generated",
                });
            }

            //3.
            await prisma.episode.update({
                where: { id: input.episodeId },
                data: { showNotes: showNotes.content },
            });

            //4.
            const inputTokens = chatCompletion.data.usage?.prompt_tokens || 0;
            const outputTokens = chatCompletion.data.usage?.completion_tokens || 0;
            const { lastChatOuputAction, lastChatInputAction } = lastChatActions;
            await postChatInputAndOutputToStripeAndDb({
                subscription,
                inputTokens,
                outputTokens,
                lastChatInputAction,
                lastChatOuputAction,
            });
        }),

    generateKeyWordsFromShowNotes: protectedProcedure
        .input(
            z.object({
                episodeId: z.string().min(1),
                showNotes: z.string().min(1),
            }),
        )
        .mutation(async ({ input, ctx }) => {
            // 1. If subscription is trial, then check credits, reject when not sufficient
            // 2. Get chat completion
            // 3. Save chat completion to db
            // 4. Execute stripe and db usage handler

            const subscription = await prisma.subscription.findUniqueOrThrow({
                where: { userId: ctx.session.user.id },
                include: { subscriptionItems: true },
            });
            const tokenCountAverage = encode(input.showNotes).length;
            const model = handleChatModel(tokenCountAverage);

            //1.
            const lastChatActions = await checkIfTrialHasEnoughChatCredits({
                tokenCountAverage,
                subscription,
                outputCutoff: 500,
            });

            //2.

            const content = `Using this podcast's show notes, generate a comma separated text string of keywords that are relevant for this podcast's discoverability. Keywords are not sentences they are a single word. Only respond with the comma separated list. This are the show notes: ${input.showNotes}. The comma separated list should not be longer than 12 words. I repeat, it should NOT go over 12 words.`;

            const chatCompletion = await openai.createChatCompletion({
                model,
                messages: [systemMessage, { role: "user", content }],
            });

            const keywords = chatCompletion.data.choices[0]?.message;
            if (!keywords) {
                throw new TRPCError({
                    code: "INTERNAL_SERVER_ERROR",
                    message: "No keywords generated",
                });
            }

            //3.
            await prisma.episode.update({
                where: { id: input.episodeId },
                data: { keywords: keywords.content },
            });

            //4.
            const inputTokens = chatCompletion.data.usage?.prompt_tokens || 0;
            const outputTokens = chatCompletion.data.usage?.completion_tokens || 0;
            const { lastChatOuputAction, lastChatInputAction } = lastChatActions;
            await postChatInputAndOutputToStripeAndDb({
                subscription,
                inputTokens,
                outputTokens,
                lastChatInputAction,
                lastChatOuputAction,
            });

        }),
});

export const postChatInputAndOutputToStripeAndDb = async ({
    subscription,
    inputTokens,
    outputTokens,
    lastChatInputAction,
    lastChatOuputAction,
}: {
    subscription: any;
    inputTokens: number;
    outputTokens: number;
    lastChatInputAction: SubscriptionCreditsActions | null;
    lastChatOuputAction: SubscriptionCreditsActions | null;
}) => {
    const postChatInputToDb = async (x: Decimal) =>
        await saveChatUsageToDb({
            tokens: x,
            subscriptionId: subscription.id,
            lastChatAction: lastChatInputAction,
            chatType: "CHAT_INPUT",
        });
    const postChatInputToStripe = async (x: number) =>
        await postChatUsageToStripe({
            subscription,
            usage: x,
            chatType: "CHAT_INPUT",
        });

    //Hanlde input credits and usage posting
    await handleCreditUsageCalculation({
        usageAmount: inputTokens,
        currentAmount: lastChatInputAction?.currentAmount,
        reportUsageToStripeFunc: postChatInputToStripe,
        discountFromCreditsFunc: postChatInputToDb,
    });

    //Chat Output
    const postChatOutputToDb = async (x: Decimal) =>
        await saveChatUsageToDb({
            tokens: x,
            subscriptionId: subscription.id,
            lastChatAction: lastChatOuputAction,
            chatType: "CHAT_OUTPUT",
        });
    const postChatOutputToStripe = async (x: number) =>
        await postChatUsageToStripe({
            subscription,
            usage: x,
            chatType: "CHAT_OUTPUT",
        });

    //Hanlde input credits and usage posting
    await handleCreditUsageCalculation({
        usageAmount: outputTokens,
        currentAmount: lastChatOuputAction?.currentAmount,
        reportUsageToStripeFunc: postChatOutputToStripe,
        discountFromCreditsFunc: postChatOutputToDb,
    });
};
