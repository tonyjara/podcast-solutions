import { z } from "zod";
import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import Decimal from "decimal.js";
import {
  calculateAudioMinutes,
  handleChatUsage,
  registerStripeUsage,
} from "./routeUtils/StripeUsageUtils";

const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Stripe key not found",
  });
}
const stripe = new Stripe(stripeKey, {
  apiVersion: "2022-11-15",
});

export const stripeUsageRouter = createTRPCRouter({
  getMySubscription: adminProcedure.mutation(async ({ ctx }) => {
    const user = ctx.session.user;

    const subscription = await prisma.subscription.findUniqueOrThrow({
      where: { userId: user.id },
    });
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.id,
    );
    return { subscription, stripeSubscription };
  }),
  getMyUsage: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;

    const PSSubscription = await prisma.subscription.findUniqueOrThrow({
      where: { userId: user.id },
      include: { subscriptionItems: true },
    });

    const lastChatInputAction =
      await prisma.subscriptionCreditsActions.findFirst({
        where: { subscriptionId: PSSubscription.id, tag: "CHAT_INPUT" },
        orderBy: { id: "desc" },
      });

    const lastChatOutputAction =
      await prisma.subscriptionCreditsActions.findFirst({
        where: { subscriptionId: PSSubscription.id, tag: "CHAT_OUTPUT" },
        orderBy: { id: "desc" },
      });

    const lastTranscriptionAction =
      await prisma.subscriptionCreditsActions.findFirst({
        where: {
          subscriptionId: PSSubscription.id,
          tag: "TRANSCRIPTION_MINUTE",
        },
        orderBy: { id: "desc" },
      });

    let summaries: any[] = [];

    for (const item of PSSubscription.subscriptionItems) {
      const usage = (await stripe.subscriptionItems.listUsageRecordSummaries(
        item.id,
        { limit: 100 },
      )) as any;
      usage.tag = item.priceTag;
      if (item.priceTag === "CHAT_INPUT") {
        usage.credits = lastChatInputAction?.currentAmount
          ? lastChatInputAction.currentAmount
          : 0;
      }

      if (item.priceTag === "CHAT_OUTPUT") {
        usage.credits = lastChatOutputAction?.currentAmount
          ? lastChatOutputAction.currentAmount
          : 0;
      }
      if (item.priceTag === "TRANSCRIPTION_MINUTE") {
        usage.credits = lastTranscriptionAction?.currentAmount
          ? lastTranscriptionAction.currentAmount
          : 0;
      }
      summaries.push(usage);
    }
    return summaries;
  }),
  postChatUsage: protectedProcedure
    .input(z.object({ inputTokens: z.number(), outputTokens: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      await prisma.$transaction(async (tx) => {
        const PSSubscription = await tx.subscription.findUniqueOrThrow({
          where: { userId: user.id },
          include: { subscriptionItems: true },
        });

        const chatInputItem = PSSubscription.subscriptionItems.find(
          (item) => item.priceTag === "CHAT_INPUT",
        );

        const chatOutputItem = PSSubscription.subscriptionItems.find(
          (item) => item.priceTag === "CHAT_OUTPUT",
        );

        if (!chatInputItem || !chatOutputItem) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Chat input or output item not found",
          });
        }

        //INPUT
        const lastInputAction = await tx.subscriptionCreditsActions.findFirst({
          where: { subscriptionId: PSSubscription.id, tag: "CHAT_INPUT" },
          orderBy: { id: "desc" },
        });

        const reportChatInputUsage = async (x: number) => {
          await registerStripeUsage({
            usage: x,
            subscriptionItemId: chatInputItem.id,
            stripe,
          });
        };
        const substractChatInputTokens = async (x: Decimal) => {
          await tx.subscriptionCreditsActions.create({
            data: {
              amount: x,
              tag: "CHAT_INPUT",
              prevAmount: lastInputAction?.currentAmount,
              currentAmount: lastInputAction?.currentAmount.sub(x),
              subscriptionId: PSSubscription.id,
            },
          });
        };

        const inputUsage = await handleChatUsage({
          usageAmount: input.inputTokens,
          currentAmount: lastInputAction?.currentAmount ?? new Decimal(0),
          reportUsage: reportChatInputUsage,
          discountFromCredits: substractChatInputTokens,
        });

        //OUTPUT
        //
        const lastOutputAction = await tx.subscriptionCreditsActions.findFirst({
          where: { subscriptionId: PSSubscription.id, tag: "CHAT_OUTPUT" },
          orderBy: { id: "desc" },
        });
        const reportChatOutputUsage = async (x: number) => {
          await registerStripeUsage({
            usage: x,
            subscriptionItemId: chatOutputItem.id,
            stripe,
          });
        };
        const substractChatOutputTokens = async (x: Decimal) => {
          await tx.subscriptionCreditsActions.create({
            data: {
              amount: x,
              tag: "CHAT_OUTPUT",
              prevAmount: lastOutputAction?.currentAmount ?? new Decimal(0),
              currentAmount: lastOutputAction?.currentAmount.sub(x),
              subscriptionId: PSSubscription.id,
            },
          });
        };

        const outputUsage = await handleChatUsage({
          usageAmount: input.outputTokens,
          currentAmount: lastOutputAction?.currentAmount ?? new Decimal(0),
          reportUsage: reportChatOutputUsage,
          discountFromCredits: substractChatOutputTokens,
        });

        return { inputUsage, outputUsage };
      });
    }),

  postAudioTranscriptionUsage: protectedProcedure
    .input(z.object({ durationInSeconds: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const dudationInMinutes = calculateAudioMinutes(input.durationInSeconds);

      await prisma.$transaction(async (tx) => {
        const PSSubscription = await tx.subscription.findUniqueOrThrow({
          where: { userId: user.id },
          include: { subscriptionItems: true },
        });

        const audioSubscriptionItem = PSSubscription.subscriptionItems.find(
          (item) => item.priceTag === "TRANSCRIPTION_MINUTE",
        );

        if (!audioSubscriptionItem) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Transcription item not found",
          });
        }

        const lastTranscriptionAction =
          await tx.subscriptionCreditsActions.findFirst({
            where: {
              subscriptionId: PSSubscription.id,
              tag: "TRANSCRIPTION_MINUTE",
            },
            orderBy: { id: "desc" },
          });

        const reportTranscriptionUsage = async (x: number) => {
          await registerStripeUsage({
            usage: x,
            subscriptionItemId: audioSubscriptionItem.id,
            stripe,
          });
        };
        const substractTranscriptionCredits = async (x: Decimal) => {
          await tx.subscriptionCreditsActions.create({
            data: {
              amount: x,
              tag: "TRANSCRIPTION_MINUTE",
              prevAmount: lastTranscriptionAction?.currentAmount,
              currentAmount: lastTranscriptionAction?.currentAmount.sub(x),
              subscriptionId: PSSubscription.id,
            },
          });
        };

        const transactionUsage = await handleChatUsage({
          usageAmount: dudationInMinutes,
          currentAmount:
            lastTranscriptionAction?.currentAmount ?? new Decimal(0),
          reportUsage: reportTranscriptionUsage,
          discountFromCredits: substractTranscriptionCredits,
        });

        return { transactionUsage };
      });
    }),
  addChatCredits: protectedProcedure
    .input(z.object({ inputTokens: z.number(), outputTokens: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const user = ctx.session.user;

      const PSSubscription = await prisma.subscription.findUniqueOrThrow({
        where: { userId: user.id },
      });

      const lastInputAction = await prisma.subscriptionCreditsActions.findFirst(
        {
          where: { subscriptionId: PSSubscription.id, tag: "CHAT_INPUT" },
          orderBy: { id: "desc" },
        },
      );
      await prisma.subscriptionCreditsActions.create({
        data: {
          tag: "CHAT_INPUT",
          amount: new Decimal(input.inputTokens),
          prevAmount: lastInputAction?.currentAmount ?? new Decimal(0),
          currentAmount: lastInputAction
            ? lastInputAction?.currentAmount.add(new Decimal(input.inputTokens))
            : new Decimal(input.inputTokens),
          subscriptionId: PSSubscription.id,
        },
      });

      const lastOutputAction =
        await prisma.subscriptionCreditsActions.findFirst({
          where: { subscriptionId: PSSubscription.id, tag: "CHAT_OUTPUT" },
          orderBy: { id: "desc" },
        });
      await prisma.subscriptionCreditsActions.create({
        data: {
          tag: "CHAT_OUTPUT",
          amount: new Decimal(input.inputTokens),
          prevAmount: lastOutputAction?.currentAmount ?? new Decimal(0),
          currentAmount: lastOutputAction
            ? lastOutputAction?.currentAmount.add(
                new Decimal(input.outputTokens),
              )
            : new Decimal(input.outputTokens),
          subscriptionId: PSSubscription.id,
        },
      });
    }),
});
