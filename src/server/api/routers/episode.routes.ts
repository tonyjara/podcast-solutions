import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { validateEpisodeEdit } from "@/components/Validations/EpisodeEdit.validate";
import { EpisodeStatus } from "@prisma/client";
import { handleSortEpisodes } from "./routeUtils/Sorting.routeUtils";
import { TRPCError } from "@trpc/server";

export const episodesRouter = createTRPCRouter({
  createEpisodeWithTitle: protectedProcedure
    .input(z.object({ title: z.string().min(3) }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (!user) throw new Error("User not found");
      const preferences = await prisma.preferences.findUniqueOrThrow({
        where: { userId: user.id },
      });
      const subscription = await prisma.subscription.findUniqueOrThrow({
        where: { userId: user.id, active: true },
      });
      const podcast = await prisma.podcast.findUniqueOrThrow({
        where: { id: preferences.selectedPodcastId },
      });
      return await prisma.episode.create({
        data: {
          episodeNumber: 1,
          seasonNumber: 1,
          title: input.title,
          showNotes: "",
          transcription: "",
          imageUrl: podcast.imageUrl,
          explicit: podcast.explicit,
          status: "draft",
          podcast: { connect: { id: podcast.id } },
          subscription: { connect: { id: subscription.id } },
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

  updateEpisodeStatus: protectedProcedure
    .input(z.object({ id: z.string(), status: z.nativeEnum(EpisodeStatus) }))
    .mutation(async ({ input }) => {
      const episode = await prisma.episode.findUniqueOrThrow({
        where: { id: input.id },
      });
      if (!episode.selectedAudioFileId && input.status) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Please select an audio file before publishing",
        });
      }
      return await prisma.episode.update({
        where: { id: input.id },
        data: {
          status: input.status,
        },
      });
    }),

  getEpisodeWithAudioFiles: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      return await prisma.episode.findUnique({
        where: { id: input.id },
        include: { audioFiles: { orderBy: { isSelected: "asc" } } },
      });
    }),
  countEpisodesFromSelectedPodcast: protectedProcedure
    .input(
      z.object({
        whereFilterList: z.any().array().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const preferences = await prisma.preferences.findUnique({
        where: { userId: userId },
      });
      if (!preferences) return null;

      return await prisma.episode.count({
        where: {
          podcastId: preferences.selectedPodcastId,
          AND: [...(input?.whereFilterList ?? [])],
        },
      });
    }),

  getMySelectedPodcastEpisodes: protectedProcedure
    .input(
      z.object({
        pageIndex: z.number().nullish(),
        pageSize: z.number().min(1).max(100).nullish(),
        whereFilterList: z.any().array().optional(),
        sorting: z
          .object({ id: z.string(), desc: z.boolean() })
          .array()
          .nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const preferences = await prisma.preferences.findUnique({
        where: { userId: userId },
      });
      if (!preferences) return null;

      const pageSize = input.pageSize ?? 10;
      const pageIndex = input.pageIndex ?? 0;

      const episodes = await prisma.episode.findMany({
        take: pageSize,
        skip: pageIndex * pageSize,
        orderBy: handleSortEpisodes({ input }),
        where: {
          podcastId: preferences.selectedPodcastId,
          AND: [...(input?.whereFilterList ?? [])],
        },
      });

      return episodes;
    }),

  countEpisodesWithPodcastId: publicProcedure
    .input(
      z.object({
        podcastId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await prisma.episode.count({
        where: {
          podcastId: input.podcastId,
        },
      });
    }),

  getEpisodesWithPodcastId: publicProcedure
    .input(
      z.object({
        pageIndex: z.number().nullish(),
        pageSize: z.number().min(1).max(100).nullish(),
        podcastId: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const pageSize = input.pageSize ?? 10;
      const pageIndex = input.pageIndex ?? 0;

      const episodes = await prisma.episode.findMany({
        take: pageSize,
        skip: pageIndex * pageSize,
        orderBy: { releaseDate: "desc" },
        include: { audioFiles: true },
        where: {
          podcastId: input.podcastId,
          status: "published",
          releaseDate: {
            lte: new Date(),
          },
        },
      });

      return episodes;
    }),
});
