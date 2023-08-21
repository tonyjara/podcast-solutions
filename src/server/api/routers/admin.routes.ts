import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const adminRouter = createTRPCRouter({
  flush: publicProcedure.mutation(async () => {
    // Just do npx prisma migrate reset
    if (process.env.NODE_ENV !== "development") return;
    /* const models = Object.keys(prisma).filter((key) => key[0] !== "_"); */
    /**/
    /* const promises = models.map((name) => { */
    /*   // @ts-expect-error */
    /*   return prisma[name].deleteMany(); */
    /* }); */
    /* await Promise.all(promises); */

    return {
      message: "Flushed",
    };
  }),
});
