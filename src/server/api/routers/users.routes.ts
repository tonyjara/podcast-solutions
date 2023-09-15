import { z } from "zod"
import {
    createTRPCRouter,
    publicProcedure,
    protectedProcedure,
} from "@/server/api/trpc"
import { prisma } from "@/server/db"
import { validateProfileEdit } from "@/components/Validations/profileEdit.validate"

export const usersRouter = createTRPCRouter({
    getUserById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input }) => {
            return await prisma.user.findUniqueOrThrow({
                where: { id: input.id },
            })
        }),

    getMyPreferences: protectedProcedure.query(({ ctx }) => {
        const userId = ctx.session.user.id
        return ctx.prisma.preferences.findUnique({
            where: {
                userId: userId,
            },
        })
    }),

    getMySubsCription: protectedProcedure.query(({ ctx }) => {
        const userId = ctx.session.user.id
        return ctx.prisma.subscription.findUnique({
            where: {
                userId: userId,
            },
            include: {
                user: {
                    select: {
                        preferences: { select: { hasSeenOnboarding: true } },
                    },
                },
            },
        })
    }),

    getSecretMessage: protectedProcedure.query(() => {
        return "you can now see jhis secret message!"
    }),
    updateMyPreferences: protectedProcedure
        .input(
            z.object({
                hasSeenOnboarding: z.boolean(),
                selectedPodcastId: z.string().min(1),
            })
        )
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id
            return await prisma.preferences.upsert({
                where: { userId: userId },
                create: {
                    hasSeenOnboarding: input.hasSeenOnboarding,
                    userId: userId,
                    selectedPodcastId: input.selectedPodcastId,
                },
                update: {
                    hasSeenOnboarding: input.hasSeenOnboarding,
                    selectedPodcastId: input.selectedPodcastId,
                },
            })
        }),
    updateProfile: protectedProcedure
        .input(validateProfileEdit)
        .mutation(async ({ input, ctx }) => {
            const userId = ctx.session.user.id
            await prisma.user.update({
                where: { id: userId },
                data: {
                    firstName: input.firstName,
                    lastName: input.lastName,
                    image: input.avatarUrl,
                },
            })
        }),
})
