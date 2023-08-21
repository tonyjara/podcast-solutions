import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { encode } from "gpt-tokenizer";
import { systemMessage } from "@/lib/Constants";
import { TRPCError } from "@trpc/server";

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
    .mutation(async ({ input }) => {
      await prisma.episodeChat.create({
        data: {
          role: "user",
          content: input.userContent,
          episodeId: input.episodeId,
        },
      });

      const tokenCountAverage = encode(input.userContent).length;

      const handleModel = () => {
        if (tokenCountAverage > 31000) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Exceeded token limit",
          });
        }
        if (tokenCountAverage > 3000) {
          return "gpt-3.5-turbo-16k";
        }
        if (tokenCountAverage > 14000) {
          return "gpt-4-32k";
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

      //Response example
      /*        data: { */
      /*   id: 'chatcmpl-7nVW4pb3Yn0Y9hFySnr8OgtbZqUvZ', */
      /*   object: 'chat.completion', */
      /*   created: 1692033576, */
      /*   model: 'gpt-3.5-turbo-16k-0613', */
      /*   choices: [ [Object] ], */
      /*   usage: { prompt_tokens: 3099, completion_tokens: 221, total_tokens: 3320 } */
      /* } */
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
    .mutation(async ({ input }) => {
      const tokenCountAverage = encode(input.transcription).length;

      const handleModel = () => {
        if (tokenCountAverage > 31000) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Exceeded token limit",
          });
        }

        if (tokenCountAverage > 3000) {
          return "gpt-3.5-turbo-16k";
        }
        if (tokenCountAverage > 14000) {
          return "gpt-4-32k";
        }

        return "gpt-3.5-turbo";
      };

      const content = `Using this podcast transcription: "${input.transcription}", please generate show notes similar to the ones that podcasts have.  Return only the show notes in HTML format.`;

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

      //Response example
      /*        data: { */
      /*   id: 'chatcmpl-7nVW4pb3Yn0Y9hFySnr8OgtbZqUvZ', */
      /*   object: 'chat.completion', */
      /*   created: 1692033576, */
      /*   model: 'gpt-3.5-turbo-16k-0613', */
      /*   choices: [ [Object] ], */
      /*   usage: { prompt_tokens: 3099, completion_tokens: 221, total_tokens: 3320 } */
      /* } */
    }),
});
