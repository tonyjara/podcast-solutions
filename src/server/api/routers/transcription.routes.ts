import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { z } from "zod";
import { Deepgram } from "@deepgram/sdk";
import { Prisma } from "@prisma/client";

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

export const transcriptionRouter = createTRPCRouter({
  transcribeAudioFromEpisode: protectedProcedure
    .input(
      z.object({
        audioFileId: z.string().min(1),
        episodeId: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      if (!deepgramApiKey) {
        throw new Error("Deepgram API key not set");
      }
      const audioFile = await prisma.audioFile.findUniqueOrThrow({
        where: { id: input.audioFileId },
      });
      const deepgram = new Deepgram(deepgramApiKey);
      const req = await deepgram.transcription.preRecorded(
        {
          url: audioFile.url,
        },
        {
          detect_language: true,
          punctuate: true,
          /* detect_entities: true, */
          /* diarize: true, */
          /* smart_format: true, */
          /* paragraphs: true, */
          /* utterances: true, */
          /* detect_topics: true, */
        },
      );

      //example of response from words
      /*       { */
      /*   word: 'developers', */
      /*   start: 0.6765447, */
      /*   end: 1.1541057, */
      /*   confidence: 0.99870956, */
      /*   punctuated_word: 'Developers,' */
      /* }, */

      const transcription =
        req.results?.channels[0]?.alternatives[0]?.transcript || "oops.";

      await prisma.episode.update({
        where: { id: input.episodeId },
        data: {
          transcription,
        },
      });

      return {
        transcription,
      };
    }),
});
