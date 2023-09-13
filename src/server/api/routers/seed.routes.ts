import { adminProcedure, createTRPCRouter } from "@/server/api/trpc"
import { prisma } from "@/server/db"
import { addMonths } from "date-fns"
import {
    addSubscriptionCredits,
    creditsPerPlan,
} from "./routeUtils/StripeUsageUtils"

const isDevEnv = process.env.NODE_ENV === "development"

export const seedRouter = createTRPCRouter({
    deleteAllAudioFiles: adminProcedure.mutation(async () => {
        if (!isDevEnv) return
        await prisma.audioFile.deleteMany()
    }),

    deleteSubscriptions: adminProcedure.mutation(async () => {
        if (!isDevEnv) return
        await prisma.subscription.deleteMany()
    }),
    deleteAllAccountsAndUsersButCurrent: adminProcedure.mutation(
        async ({ ctx }) => {
            if (!isDevEnv) return
            const user = ctx.session.user
            await prisma.user.deleteMany({
                where: {
                    NOT: {
                        id: user.id,
                    },
                },
            })
            await prisma.account.deleteMany({
                where: {
                    NOT: {
                        id: user.accountId,
                    },
                },
            })
        }
    ),
    restartAccount: adminProcedure.mutation(async ({ ctx }) => {
        if (!isDevEnv) return
        const user = ctx.session.user
        const subscription = await prisma.subscription.findUniqueOrThrow({
            where: { userId: user.id },
            include: {
                user: {
                    select: {
                        preferences: { select: { selectedPodcastId: true } },
                    },
                },
            },
        })
        await prisma.audioFile.deleteMany({
            where: { subscriptionId: subscription.id },
        })

        await prisma.directories.deleteMany({
            where: {
                podcastId: subscription.user.preferences?.selectedPodcastId,
            },
        })
        await prisma.episode.deleteMany({
            where: { subscriptionId: subscription.id },
        })
        await prisma.podcast.deleteMany({
            where: { subscriptionId: subscription.id },
        })
        await prisma.subscriptionCreditsActions.deleteMany({
            where: { subscriptionId: subscription.id },
        })
        await prisma.subscription.update({
            where: { userId: user.id },
            data: {
                isFreeTrial: true,
                cancellAt: addMonths(new Date(), 1),
            },
        })

        const credits = creditsPerPlan("TRIAL")
        //INPUT
        const lastInputAction =
            await prisma.subscriptionCreditsActions.findFirst({
                where: { subscriptionId: subscription.id, tag: "CHAT_INPUT" },
                orderBy: { id: "desc" },
            })
        await addSubscriptionCredits({
            tag: "CHAT_INPUT",
            lastAction: lastInputAction,
            amount: credits.chatInput,
            subscriptionId: subscription.id,
        })

        //OUTPUT
        const lastOutputAction =
            await prisma.subscriptionCreditsActions.findFirst({
                where: { subscriptionId: subscription.id, tag: "CHAT_OUTPUT" },
                orderBy: { id: "desc" },
            })
        await addSubscriptionCredits({
            tag: "CHAT_OUTPUT",
            lastAction: lastOutputAction,
            amount: credits.chatOutput,
            subscriptionId: subscription.id,
        })

        //TRANSCRIPTION
        const lastTranscriptionAction =
            await prisma.subscriptionCreditsActions.findFirst({
                where: {
                    subscriptionId: subscription.id,
                    tag: "TRANSCRIPTION_MINUTE",
                },
                orderBy: { id: "desc" },
            })
        await addSubscriptionCredits({
            tag: "TRANSCRIPTION_MINUTE",
            lastAction: lastTranscriptionAction,
            amount: credits.transcription,
            subscriptionId: subscription.id,
        })
    }),
})
