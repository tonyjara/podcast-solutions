import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import slugify from "@sindresorhus/slugify";
import { validatePodcastEdit } from "@/components/Validations/PodcastEdit.validate";

export const podcastRouter = createTRPCRouter({
  createPodcastWithName: protectedProcedure
    .input(z.object({ name: z.string().min(3) }))
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;
      if (!user) throw new Error("User not found");

      const podcast = await prisma.podcast.create({
        data: {
          name: input.name,
          slug: slugify(input.name),
          description: "",
          imageUrl: "",
          email: user.email,
          author: `${user.firstName} ${user.lastName}`,
          category: "",
          explicit: false,
          language: "en",
          user: {
            connect: {
              id: user.id,
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
    return prisma.podcast.findMany({
      where: {
        user: {
          some: { id: ctx.session.user.id },
        },
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
          category: input.category,
          description: input.description,
          explicit: input.explicit,
          language: input.language,
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
      include: { episodes: true },
    });
  }),
});
