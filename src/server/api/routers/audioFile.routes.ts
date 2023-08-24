import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { deleteAzureBlob } from "@/lib/utils/azure-delete-blob";
import slugify from "slugify";
import { validateAudioFile } from "@/components/Validations/Validate.AudioFile";

export const audioFileRoute = createTRPCRouter({
  createAudioFileForEpisode: protectedProcedure
    .input(validateAudioFile)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (!user) throw new Error("User not found");
      const preferences = await prisma.preferences.findUniqueOrThrow({
        where: { userId: user.id },
      });
      const podcast = await prisma.podcast.findUniqueOrThrow({
        where: { id: preferences.selectedPodcastId },
      });
      const audioFile = await prisma.audioFile.create({
        data: {
          name: input.name,
          blobName: input.blobName,
          url: input.url,
          episodeId: input.episodeId,
          podcastId: podcast.id,
          userId: user.id,
          length: input.length,
          duration: input.duration,
          type: input.type,
          isSelected: true,
        },
      });
      //change all other audio files to isSelected: false
      await prisma.audioFile.updateMany({
        where: {
          episodeId: input.episodeId,
          isSelected: true,
          id: { not: audioFile.id },
        },
        data: { isSelected: false },
      });
      await prisma.episode.update({
        where: { id: input.episodeId },
        data: {
          selectedAudioFileId: audioFile.id,
        },
      });
      return audioFile;
    }),
  checkIfNameIsUniqueForEpisode: protectedProcedure
    .input(z.object({ name: z.string().min(3), episodeId: z.string().min(3) }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;

      const audioFile = await prisma.audioFile.findFirst({
        where: {
          blobName: `${input.episodeId}-${slugify(input.name, {
            lower: true,
          })}-audio-file`,
          episodeId: input.episodeId,
          userId: user.id,
        },
      });

      return { isUnique: audioFile ? false : true };
    }),
  selectAudioFileForEpisode: protectedProcedure
    .input(
      z.object({
        audioFileId: z.string().min(3),
        episodeId: z.string().min(3),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      await prisma.episode.update({
        where: { id: input.episodeId, userId: user.id },
        data: { selectedAudioFileId: input.audioFileId },
      });
      await prisma.audioFile.update({
        where: { id: input.audioFileId },
        data: { isSelected: true },
      });
      await prisma.audioFile.updateMany({
        where: { id: { not: input.audioFileId }, episodeId: input.episodeId },
        data: { isSelected: false },
      });
    }),
  deleteAudioFile: protectedProcedure
    .input(
      z.object({
        id: z.string().min(3),
        blobName: z.string().min(3),
        isHostedByPS: z.boolean(),
        connectionString: z.string().min(3),
        episodeId: z.string().min(3),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const user = ctx.session.user;

        if (!input.isHostedByPS) {
          await deleteAzureBlob({
            containerName: user.id,
            blobName: input.blobName,
            connectionString: input.connectionString,
          });
        }

        const episode = await prisma.episode.findUnique({
          where: { id: input.episodeId },
        });
        if (episode?.selectedAudioFileId === input.id) {
          await prisma.episode.update({
            where: { id: input.episodeId },
            data: { selectedAudioFileId: null, status: "draft" },
          });
        }

        return await prisma.audioFile.delete({
          where: { id: input.id },
        });
      } catch (err) {
        console.error(err);
      }
    }),
});
