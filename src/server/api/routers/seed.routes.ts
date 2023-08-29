import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { prisma } from "@/server/db";

const isDevEnv = process.env.NODE_ENV === "development";

export const seedRouter = createTRPCRouter({
  deleteAllAudioFiles: adminProcedure.mutation(async () => {
    if (!isDevEnv) return;
    await prisma.audioFile.deleteMany();
  }),

  deleteSubscriptions: adminProcedure.mutation(async () => {
    if (!isDevEnv) return;
    await prisma.subscription.deleteMany();
  }),
  deleteAllAccountsAndUsersButCurrent: adminProcedure.mutation(
    async ({ ctx }) => {
      if (!isDevEnv) return;
      const user = ctx.session.user;
      await prisma.user.deleteMany({
        where: {
          NOT: {
            id: user.id,
          },
        },
      });
      await prisma.account.deleteMany({
        where: {
          NOT: {
            id: user.accountId,
          },
        },
      });
    },
  ),
  restartAccount: adminProcedure.mutation(async ({ ctx }) => {
    if (!isDevEnv) return;
    const user = ctx.session.user;
    await prisma.audioFile.deleteMany({ where: { userId: user.id } });
    await prisma.episode.deleteMany({ where: { userId: user.id } });
    await prisma.podcast.deleteMany({
      where: { user: { every: { id: user.id } } },
    });
    const subscription = await prisma.subscription.findUniqueOrThrow({
      where: { userId: user.id },
    });
    await prisma.subscriptionCreditsActions.deleteMany({
      where: { subscriptionId: subscription.id },
    });
    await prisma.subscriptionCreditsActions.deleteMany({
      where: { subscriptionId: subscription.id },
    });
    await prisma.subscription.deleteMany({ where: { userId: user.id } });
  }),
});
