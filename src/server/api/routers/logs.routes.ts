import {
  adminProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import Parser from "rss-parser";
import {
  parseEpisodesAndAudioFilesFromFeed,
  parsePodcastFromFeed,
} from "./routeUtils/ParsePodcastFromFeed";
import { prisma } from "@/server/db";

export const logsRouter = createTRPCRouter({
  getLogs: adminProcedure.query(async () => {
    return await prisma.logs.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),
});
