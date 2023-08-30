import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { z } from "zod";
import Parser from "rss-parser";
import {
  parseEpisodesAndAudioFilesFromFeed,
  parsePodcastFromFeed,
} from "./routeUtils/ParsePodcastFromFeed";
import { prisma } from "@/server/db";

export const rssRouter = createTRPCRouter({
  parseFeedUrl: protectedProcedure
    .input(
      z.object({
        rssFeedUrl: z.string().url().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        const parser = new Parser();
        const feed = await parser.parseURL(input.rssFeedUrl);

        return { error: false, message: "Feed parsed successfully", feed };
      } catch (error) {
        console.error(error);
        return {
          error: true,
          message:
            "The url could not be processed, are you sure it's an RSS Feed?",
        };
      }
    }),
  importFeed: protectedProcedure
    .input(
      z.object({
        rssFeedUrl: z.string().url().min(1),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session?.user;
      return await prisma.$transaction(async (tx) => {
        const subscription = await tx.subscription.findUniqueOrThrow({
          where: { userId: user.id, active: true },
        });

        const parser = new Parser();
        const feed = await parser.parseURL(input.rssFeedUrl);
        const parsedPodcast = parsePodcastFromFeed({
          feed,
          email: user.email,
          subscriptionId: subscription.id,
        });
        const parsedEpisodesWithAudioFiles = parseEpisodesAndAudioFilesFromFeed(
          {
            feed,
            podcastId: parsedPodcast.id,
            subscriptionId: subscription.id,
          },
        );
        const parsedEpisodes = parsedEpisodesWithAudioFiles.episodes;
        const parsedAudioFiles = parsedEpisodesWithAudioFiles.audioFiles;

        const podcast = await tx.podcast.create({
          data: {
            ...parsedPodcast,
            subscriptionId: subscription.id,
          },
        });

        await tx.episode.createMany({
          data: parsedEpisodes,
        });
        await tx.audioFile.createMany({
          data: parsedAudioFiles,
        });

        await tx.preferences.upsert({
          where: { userId: user.id },
          create: { userId: user.id, selectedPodcastId: podcast.id },
          update: { selectedPodcastId: podcast.id },
        });
        return podcast;
      });
    }),
});

// https://feed.syntax.fm/rss
// https://media.rss.com/thegroupchatlol/feed.xml
