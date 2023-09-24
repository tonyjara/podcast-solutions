import { z } from "zod"
import {
    adminProcedure,
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc"
import Stripe from "stripe"
import { TRPCError } from "@trpc/server"
import { prisma } from "@/server/db"
import Decimal from "decimal.js"

export interface UsageStats {
    tag: string
    credits: Decimal
    data: Stripe.UsageRecordSummary[]
}

const stripeKey = process.env.STRIPE_SECRET_KEY

if (!stripeKey) {
    throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Stripe key not found",
    })
}
const stripe = new Stripe(stripeKey, {
    apiVersion: "2023-08-16",
})

export const stripeUsageRouter = createTRPCRouter({
    getMySubscription: adminProcedure.mutation(async ({ ctx }) => {
        const user = ctx.session.user

        const subscription = await prisma.subscription.findUniqueOrThrow({
            where: { userId: user.id },
        })
        const stripeSubscription = await stripe.subscriptions.retrieve(
            subscription.id
        )
        return { subscription, stripeSubscription }
    }),
    getMyUsage: protectedProcedure.query(async ({ ctx }) => {
        const user = ctx.session.user

        const PSSubscription = await prisma.subscription.findUniqueOrThrow({
            where: { userId: user.id },
            include: { subscriptionItems: true },
        })

        const lastChatInputAction =
            await prisma.subscriptionCreditsActions.findFirst({
                where: { subscriptionId: PSSubscription.id, tag: "CHAT_INPUT" },
                orderBy: { id: "desc" },
            })

        const lastChatOutputAction =
            await prisma.subscriptionCreditsActions.findFirst({
                where: {
                    subscriptionId: PSSubscription.id,
                    tag: "CHAT_OUTPUT",
                },
                orderBy: { id: "desc" },
            })

        const lastTranscriptionAction =
            await prisma.subscriptionCreditsActions.findFirst({
                where: {
                    subscriptionId: PSSubscription.id,
                    tag: "TRANSCRIPTION_MINUTE",
                },
                orderBy: { id: "desc" },
            })

        let summaries: UsageStats[] = [
            {
                tag: "CHAT_INPUT",
                credits: lastChatInputAction?.currentAmount
                    ? lastChatInputAction.currentAmount
                    : new Decimal(0),
                data: [],
            },

            {
                tag: "CHAT_OUTPUT",
                credits: lastChatOutputAction?.currentAmount
                    ? lastChatOutputAction.currentAmount
                    : new Decimal(0),
                data: [],
            },

            {
                tag: "TRANSCRIPTION_MINUTE",
                credits: lastTranscriptionAction?.currentAmount
                    ? lastTranscriptionAction.currentAmount
                    : new Decimal(0),
                data: [],
            },
        ]
        //For free trial
        if (!PSSubscription.subscriptionItems.length) {
            return summaries
        }

        let summariesWithUsage: UsageStats[] = []
        for await (const summary of summaries) {
            const item = PSSubscription.subscriptionItems.find(
                (subItem) => subItem.priceTag === summary.tag
            )
            if (!item) {
                summariesWithUsage.push(summary)
                return
            }

            const usage =
                await stripe.subscriptionItems.listUsageRecordSummaries(
                    item.id,
                    { limit: 100 }
                )
            if (usage.data) {
                summary.data = usage.data
            }
            summariesWithUsage.push(summary)
        }

        return summariesWithUsage
    }),

    addChatCredits: protectedProcedure
        .input(z.object({ inputTokens: z.number(), outputTokens: z.number() }))
        .mutation(async ({ ctx, input }) => {
            const user = ctx.session.user

            const PSSubscription = await prisma.subscription.findUniqueOrThrow({
                where: { userId: user.id },
            })

            const lastInputAction =
                await prisma.subscriptionCreditsActions.findFirst({
                    where: {
                        subscriptionId: PSSubscription.id,
                        tag: "CHAT_INPUT",
                    },
                    orderBy: { id: "desc" },
                })
            await prisma.subscriptionCreditsActions.create({
                data: {
                    tag: "CHAT_INPUT",
                    amount: new Decimal(input.inputTokens),
                    prevAmount:
                        lastInputAction?.currentAmount ?? new Decimal(0),
                    currentAmount: lastInputAction
                        ? lastInputAction?.currentAmount.add(
                              new Decimal(input.inputTokens)
                          )
                        : new Decimal(input.inputTokens),
                    subscriptionId: PSSubscription.id,
                },
            })

            const lastOutputAction =
                await prisma.subscriptionCreditsActions.findFirst({
                    where: {
                        subscriptionId: PSSubscription.id,
                        tag: "CHAT_OUTPUT",
                    },
                    orderBy: { id: "desc" },
                })
            await prisma.subscriptionCreditsActions.create({
                data: {
                    tag: "CHAT_OUTPUT",
                    amount: new Decimal(input.outputTokens),
                    prevAmount:
                        lastOutputAction?.currentAmount ?? new Decimal(0),
                    currentAmount: lastOutputAction
                        ? lastOutputAction?.currentAmount.add(
                              new Decimal(input.outputTokens)
                          )
                        : new Decimal(input.outputTokens),
                    subscriptionId: PSSubscription.id,
                },
            })
        }),
})
