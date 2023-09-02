import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { encode } from "gpt-tokenizer";
import { systemMessage } from "@/lib/Constants";
import { TRPCError } from "@trpc/server";
import { appRouter } from "../router";

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
      await prisma.episodeChat.create({
        data: {
          role: "user",
          content: input.userContent,
          episodeId: input.episodeId,
        },
      });

      const tokenCountAverage = encode(input.userContent).length;

      const handleModel = () => {
        if (tokenCountAverage > 16000) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Exceeded token limit",
          });
        }
        if (tokenCountAverage > 3000) {
          return "gpt-3.5-turbo-16k";
        }
        return "gpt-3.5-turbo";
      };

      const chatCompletion = await openai.createChatCompletion({
        model: handleModel(),
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

      await prisma.episodeChat.create({
        data: {
          role: "assistant",
          content: response.content,
          episodeId: input.episodeId,
        },
      });

      const inputTokens = chatCompletion.data.usage?.prompt_tokens || 0;
      const outputTokens = chatCompletion.data.usage?.completion_tokens || 0;
      const caller = appRouter.createCaller({ session: ctx.session, prisma });
      await caller.stripeUsage.postChatUsage({ inputTokens, outputTokens });

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
      const tokenCountAverage = encode(input.transcription).length;

      const handleModel = () => {
        if (tokenCountAverage > 16000) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Exceeded token limit",
          });
        }

        if (tokenCountAverage > 3000) {
          return "gpt-3.5-turbo-16k";
        }
        return "gpt-3.5-turbo";
      };

      const content = `Using this podcast transcription, auto detect the language and generate show notes that reflect the transcription content, similar to what podcasts have.  Return only the show notes in HTML format. The show notes should be in the same language as the transcription. Here's the transcript: "${input.transcription}" `;

      const chatCompletion = await openai.createChatCompletion({
        model: handleModel(),
        messages: [systemMessage, { role: "user", content }],
      });

      const showNotes = chatCompletion.data.choices[0]?.message;
      if (!showNotes) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No show notes generated",
        });
      }

      await prisma.episode.update({
        where: { id: input.episodeId },
        data: { showNotes: showNotes.content },
      });

      const inputTokens = chatCompletion.data.usage?.prompt_tokens || 0;
      const outputTokens = chatCompletion.data.usage?.completion_tokens || 0;
      const caller = appRouter.createCaller({ session: ctx.session, prisma });
      await caller.stripeUsage.postChatUsage({ inputTokens, outputTokens });
    }),

  generateKeyWordsFromShowNotes: protectedProcedure
    .input(
      z.object({
        episodeId: z.string().min(1),
        showNotes: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const tokenCountAverage = encode(input.showNotes).length;

      const handleModel = () => {
        if (tokenCountAverage > 16000) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Exceeded token limit",
          });
        }

        if (tokenCountAverage > 3000) {
          return "gpt-3.5-turbo-16k";
        }
        return "gpt-3.5-turbo";
      };

      const content = `Using this podcast's show notes, generate a comma separated text string of keywords that are relevant for this podcast's discoverability. Keywords are not sentences they are a single word. Only respond with the comma separated list. This are the show notes: ${input.showNotes}. The comma separated list should not be longer than 12 words. I repeat, it should NOT go over 12 words.`;

      const chatCompletion = await openai.createChatCompletion({
        model: handleModel(),
        messages: [systemMessage, { role: "user", content }],
      });

      const keywords = chatCompletion.data.choices[0]?.message;
      if (!keywords) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No keywords generated",
        });
      }

      await prisma.episode.update({
        where: { id: input.episodeId },
        data: { keywords: keywords.content },
      });

      const inputTokens = chatCompletion.data.usage?.prompt_tokens || 0;
      const outputTokens = chatCompletion.data.usage?.completion_tokens || 0;
      const caller = appRouter.createCaller({ session: ctx.session, prisma });
      await caller.stripeUsage.postChatUsage({ inputTokens, outputTokens });
    }),
});

//Chat completion response example
/*        data: { */
/*   id: 'chatcmpl-7nVW4pb3Yn0Y9hFySnr8OgtbZqUvZ', */
/*   object: 'chat.completion', */
/*   created: 1692033576, */
/*   model: 'gpt-3.5-turbo-16k-0613', */
/*   choices: [ [Object] ], */
/*   usage: { prompt_tokens: 3099, completion_tokens: 221, total_tokens: 3320 } */
/* } */
