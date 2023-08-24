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

      const parser = new Parser();
      const feed = await parser.parseURL(input.rssFeedUrl);
      const parsedPodcast = parsePodcastFromFeed(feed, user.email);
      const parsedEpisodesWithAudioFiles = parseEpisodesAndAudioFilesFromFeed(
        feed,
        user.id,
        parsedPodcast.id,
      );
      const parsedEpisodes = parsedEpisodesWithAudioFiles.episodes;
      const parsedAudioFiles = parsedEpisodesWithAudioFiles.audioFiles;

      const podcast = await prisma.podcast.create({
        data: {
          ...parsedPodcast,
          user: {
            connect: { id: user.id },
          },
        },
      });

      await prisma.episode.createMany({
        data: parsedEpisodes,
      });
      await prisma.audioFile.createMany({
        data: parsedAudioFiles,
      });

      await prisma.preferences.upsert({
        where: { userId: user.id },
        create: { userId: user.id, selectedPodcastId: podcast.id },
        update: { selectedPodcastId: podcast.id },
      });
      return podcast;
    }),
});

// https://feed.syntax.fm/rss
// https://media.rss.com/thegroupchatlol/feed.xml
