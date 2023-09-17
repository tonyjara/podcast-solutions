import { z } from "zod"
import {
    adminProcedure,
    createTRPCRouter,
    protectedProcedure,
} from "@/server/api/trpc"
import { prisma } from "@/server/db"
import { deleteAzureBlob } from "@/lib/utils/azure-delete-blob"
import slugify from "slugify"
import { validateAudioFile } from "@/components/Validations/Validate.AudioFile"

export const audioFileRoute = createTRPCRouter({
    createAudioFileForEpisode: protectedProcedure
        .input(validateAudioFile)
        .mutation(async ({ input, ctx }) => {
            const user = ctx.session.user

            const preferences = await prisma.preferences.findUniqueOrThrow({
                where: { userId: user.id },
            })
            const subscription = await prisma.subscription.findUniqueOrThrow({
                where: { userId: user.id, active: true },
            })
            const podcast = await prisma.podcast.findUniqueOrThrow({
                where: { id: preferences.selectedPodcastId },
            })

            const audioFile = await prisma.audioFile.create({
                data: {
                    name: input.name,
                    blobName: input.blobName,
                    url: input.url,
                    episodeId: input.episodeId,
                    podcastId: podcast.id,
                    subscriptionId: subscription.id,
                    length: input.length,
                    duration: input.duration,
                    type: input.type,
                    isSelected: true,
                    peaks: input.peaks,
                },
            })
            //change all other audio files to isSelected: false
            await prisma.audioFile.updateMany({
                where: {
                    episodeId: input.episodeId,
                    isSelected: true,
                    id: { not: audioFile.id },
                },
                data: { isSelected: false },
            })
            await prisma.episode.update({
                where: { id: input.episodeId },
                data: {
                    selectedAudioFileId: audioFile.id,
                },
            })
            return audioFile
        }),
    checkIfNameIsUniqueForEpisode: protectedProcedure
        .input(
            z.object({ name: z.string().min(3), episodeId: z.string().min(3) })
        )
        .mutation(async ({ input, ctx }) => {
            const user = ctx.session.user
            const subscription = await prisma.subscription.findUniqueOrThrow({
                where: { userId: user.id, active: true },
            })

            const audioFile = await prisma.audioFile.findFirst({
                where: {
                    blobName: `${input.episodeId}-${slugify(input.name, {
                        lower: true,
                    })}-audio-file`,
                    episodeId: input.episodeId,
                    subscriptionId: subscription.id,
                },
            })

            return { isUnique: audioFile ? false : true }
        }),
    selectAudioFileForEpisode: protectedProcedure
        .input(
            z.object({
                audioFileId: z.string().min(3),
                episodeId: z.string().min(3),
            })
        )
        .mutation(async ({ input }) => {
            await prisma.episode.update({
                where: { id: input.episodeId },
                data: { selectedAudioFileId: input.audioFileId },
            })
            await prisma.audioFile.update({
                where: { id: input.audioFileId },
                data: { isSelected: true },
            })
            await prisma.audioFile.updateMany({
                where: {
                    id: { not: input.audioFileId },
                    episodeId: input.episodeId,
                },
                data: { isSelected: false },
            })
        }),

    deletePeaks: adminProcedure
        .input(
            z.object({
                id: z.string().min(3),
            })
        )
        .mutation(async ({ input }) => {
            return await prisma.audioFile.update({
                where: { id: input.id },
                data: { peaks: [] },
            })
        }),
    deleteAudioFile: protectedProcedure
        .input(
            z.object({
                id: z.string().min(3),
                blobName: z.string().min(3),
                isHostedByPS: z.boolean(),
                connectionString: z.string().min(3),
                episodeId: z.string().min(3),
            })
        )
        .mutation(async ({ input, ctx }) => {
            try {
                const user = ctx.session.user

                if (!input.isHostedByPS) {
                    await deleteAzureBlob({
                        containerName: user.id,
                        blobName: input.blobName,
                        connectionString: input.connectionString,
                    })
                }

                const episode = await prisma.episode.findUnique({
                    where: { id: input.episodeId },
                })
                if (episode?.selectedAudioFileId === input.id) {
                    await prisma.episode.update({
                        where: { id: input.episodeId },
                        data: { selectedAudioFileId: null, status: "draft" },
                    })
                }

                return await prisma.audioFile.delete({
                    where: { id: input.id },
                })
            } catch (err) {
                console.error(err)
            }
        }),
    getEpisodeAudioFiles: protectedProcedure
        .input(z.object({ episodeId: z.string().nullish() }))
        .query(async ({ input }) => {
            if (!input.episodeId) return []
            return await prisma.audioFile.findMany({
                where: { episodeId: input.episodeId },
                orderBy: { isSelected: "asc" },
            })
        }),

    getSelectedAudioFileForEpisode: protectedProcedure
        .input(z.object({ episodeId: z.string().nullish() }))
        .query(async ({ input }) => {
            if (!input.episodeId) return null
            return await prisma.audioFile.findFirst({
                where: { episodeId: input.episodeId, isSelected: true },
            })
        }),
    updatePeaks: protectedProcedure
        .input(
            z.object({
                peaks: z.number().array(),
                audioFileId: z.string().min(1),
            })
        )
        .mutation(async ({ input }) => {
            await prisma.audioFile.update({
                where: { id: input.audioFileId },
                data: { peaks: input.peaks },
            })
        }),
})
