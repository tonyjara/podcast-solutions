import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { validateEpisodeEdit } from "@/components/Validations/EpisodeEdit.validate";

export const episodesRouter = createTRPCRouter({
  createEpisodeWithTitle: protectedProcedure
    .input(z.object({ title: z.string().min(3) }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (!user) throw new Error("User not found");
      const preferences = await prisma.preferences.findUniqueOrThrow({
        where: { userId: user.id },
      });
      const podcast = await prisma.podcast.findUniqueOrThrow({
        where: { id: preferences.selectedPodcastId },
      });
      return await prisma.episode.create({
        data: {
          title: input.title,
          showNotes: "",
          transcription: "",
          imageUrl: podcast.imageUrl,
          explicit: podcast.explicit,
          status: "draft",
          podcast: { connect: { id: podcast.id } },
          user: { connect: { id: user.id } },
        },
      });
    }),
  editEpisode: protectedProcedure
    .input(validateEpisodeEdit)
    .mutation(async ({ input }) => {
      return await prisma.episode.update({
        where: { id: input.id },
        data: {
          title: input.title,
          selectedAudioFileId: input.selectedAudioFileId,
          releaseDate: input.releaseDate,
          showNotes: input.showNotes,
          transcription: input.transcription,
          imageUrl: input.imageUrl,
          explicit: input.explicit,
          status: input.status,
          seasonNumber: input.seasonNumber,
          episodeNumber: input.episodeNumber,
          episodeType: input.episodeType,
        },
      });
    }),

  getEpisodeWithAudioFiles: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await prisma.episode.findUnique({
        where: { id: input.id },
        include: { audioFiles: true },
      });
    }),
});
