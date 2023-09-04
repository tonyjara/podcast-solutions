import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import slugify from "slugify";
import { validatePodcastEdit } from "@/components/Validations/PodcastEdit.validate";
import { PodcastStatus } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { isScheduled } from "@/lib/utils/dateUtils";
import { validateDirectories } from "@/components/Validations/Directories.validate";

export const podcastRouter = createTRPCRouter({
  createPodcastWithName: protectedProcedure
    .input(z.object({ name: z.string().min(3) }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const subscription = await prisma.subscription.findUniqueOrThrow({
        where: { userId: user.id, active: true },
      });

      const podcast = await prisma.podcast.create({
        data: {
          name: input.name,
          slug: slugify(input.name, { lower: true }),
          description: "",
          imageUrl: "",
          email: user.email,
          author: `${user.firstName} ${user.lastName}`,
          categories: [],
          explicit: false,
          language: "en",
          subscription: {
            connect: {
              id: subscription.id,
            },
          },
        },
      });
      await prisma.preferences.upsert({
        where: { userId: user.id },
        create: { userId: user.id, selectedPodcastId: podcast.id },
        update: { selectedPodcastId: podcast.id },
      });
      return podcast;
    }),
  getMyPodcasts: protectedProcedure.query(async ({ ctx }) => {
    const user = ctx.session.user;
    const subscription = await prisma.subscription.findUniqueOrThrow({
      where: { userId: user.id, active: true },
    });

    return prisma.podcast.findMany({
      where: {
        subscriptionId: subscription.id,
      },
    });
  }),
  editPodcast: protectedProcedure
    .input(validatePodcastEdit)
    .mutation(async ({ input }) => {
      return await prisma.podcast.update({
        where: { id: input.id },
        data: {
          name: input.name,
          active: input.active,
          publishedAt: input.publishedAt,
          email: input.email,
          imageUrl: input.imageUrl,
          author: input.author,
          categories: input.categories,
          description: input.description,
          explicit: input.explicit,
          language: input.language,
        },
      });
    }),

  changePodcastStatus: protectedProcedure
    .input(
      z.object({
        podcastId: z.string(),
        podcastStatus: z.nativeEnum(PodcastStatus),
      }),
    )
    .mutation(async ({ input }) => {
      if (input.podcastStatus === "published") {
        const findFirstPublishedEpisode = await prisma.episode.findFirst({
          where: {
            podcastId: input.podcastId,
            status: "published",
          },
        });
        if (
          !findFirstPublishedEpisode ||
          (findFirstPublishedEpisode.releaseDate &&
            isScheduled(findFirstPublishedEpisode.releaseDate))
        ) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message:
              "You need to publish at least one non-scheduled episode to publish the podcast",
          });
        }
      }
      return await prisma.podcast.update({
        where: { id: input.podcastId },
        data: {
          podcastStatus: input.podcastStatus,
        },
      });
    }),

  getMySelectedPodcast: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const preferences = await prisma.preferences.findUnique({
      where: { userId: userId },
    });
    if (!preferences) return null;
    return await prisma.podcast.findUnique({
      where: { id: preferences.selectedPodcastId },
    });
  }),

  getMyDirectories: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const preferences = await prisma.preferences.findUnique({
      where: { userId: userId },
    });
    if (!preferences) return null;
    return await prisma.directories.findUnique({
      where: { podcastId: preferences.selectedPodcastId },
    });
  }),
  upsertDirectories: protectedProcedure
    .input(validateDirectories)
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      const preferences = await prisma.preferences.findUnique({
        where: { userId: user.id },
      });
      if (!preferences) return null;

      await prisma.directories.upsert({
        where: { id: input.id },
        create: {
          websiteUrl: input.websiteUrl,
          twitterUrl: input.twitterUrl,
          facebookUrl: input.facebookUrl,
          instagramUrl: input.instagramUrl,
          youtubeUrl: input.youtubeUrl,
          spotifyUrl: input.spotifyUrl,
          applePodcastsUrl: input.applePodcastsUrl,
          googlePodcastsUrl: input.googlePodcastsUrl,
          stitcherUrl: input.stitcherUrl,
          tuneinUrl: input.tuneinUrl,
          pocketCastsUrl: input.pocketCastsUrl,
          overcastUrl: input.overcastUrl,
          castroUrl: input.castroUrl,
          castboxUrl: input.castboxUrl,
          podchaserUrl: input.podchaserUrl,
          deezerUrl: input.deezerUrl,
          podfriendUrl: input.podfriendUrl,
          podcastAddictUrl: input.podcastAddictUrl,
          breakerUrl: input.breakerUrl,
          radiopublicUrl: input.radiopublicUrl,
          podcastId: preferences.selectedPodcastId,
        },
        update: {
          websiteUrl: input.websiteUrl,
          twitterUrl: input.twitterUrl,
          facebookUrl: input.facebookUrl,
          instagramUrl: input.instagramUrl,
          youtubeUrl: input.youtubeUrl,
          spotifyUrl: input.spotifyUrl,
          applePodcastsUrl: input.applePodcastsUrl,
          googlePodcastsUrl: input.googlePodcastsUrl,
          stitcherUrl: input.stitcherUrl,
          tuneinUrl: input.tuneinUrl,
          pocketCastsUrl: input.pocketCastsUrl,
          overcastUrl: input.overcastUrl,
          castroUrl: input.castroUrl,
          castboxUrl: input.castboxUrl,
          podchaserUrl: input.podchaserUrl,
          deezerUrl: input.deezerUrl,
          podfriendUrl: input.podfriendUrl,
          podcastAddictUrl: input.podcastAddictUrl,
          breakerUrl: input.breakerUrl,
          radiopublicUrl: input.radiopublicUrl,
        },
      });
    }),
});
