import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { z } from "zod";
import { Deepgram } from "@deepgram/sdk";
import {
  calculateAudioMinutes,
  handleCreditUsageCalculation,
} from "./routeUtils/StripeUsageUtils";
import { checkIfTrialHasEnoughTranscriptionMinutes } from "./routeUtils/freeTrialUtils";
import { postAudioTranscriptionUsageToStripe } from "./routeUtils/PostStripeUsageUtils";
import Decimal from "decimal.js";

const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

if (!deepgramApiKey) {
  throw new Error("Deepgram API key not set");
}

export const transcriptionRouter = createTRPCRouter({
  transcribeAudioFromEpisode: protectedProcedure
    .input(
      z.object({
        audioFileId: z.string().min(1),
        episodeId: z.string().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // 1. If subscription is trial, then check if they have used up their trial transcription usage, reject when not sufficient
      // 2. Calculate credit diff and post to stripe and db
      // 3. Transcribe audio
      // 4. Save transcription to db
      const subscription = await prisma.subscription.findUniqueOrThrow({
        where: { userId: ctx.session.user.id },
        include: { subscriptionItems: true },
      });
      const audioFile = await prisma.audioFile.findUniqueOrThrow({
        where: { id: input.audioFileId },
      });
      const durationInMinutes = calculateAudioMinutes(audioFile.duration);

      //1.
      const lastTranscriptionAction =
        await checkIfTrialHasEnoughTranscriptionMinutes({
          durationInMinutes,
          subscription,
        });

      //2.
      const postToDb = async (x: Decimal) =>
        await prisma.subscriptionCreditsActions.create({
          data: {
            amount: x,
            tag: "TRANSCRIPTION_MINUTE",
            prevAmount: lastTranscriptionAction?.currentAmount,
            currentAmount:
              lastTranscriptionAction?.currentAmount.sub(durationInMinutes),
            subscriptionId: subscription.id,
          },
        });

      const postToStripe = async (x: number) =>
        await postAudioTranscriptionUsageToStripe({
          durationInMinutes: x,
          subscription,
        });

      await handleCreditUsageCalculation({
        usageAmount: durationInMinutes,
        currentAmount: lastTranscriptionAction?.currentAmount,
        reportUsageToStripeFunc: postToStripe,
        discountFromCreditsFunc: postToDb,
      });

      //3.
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
          /* detect_topics: true, //does not work */
          /* summarize: true, // works terribly */
        },
      );

      //4.
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
