import { validateCoupons } from "@/components/Validations/couponCreate.validate";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { z } from "zod";

export const adminRouter = createTRPCRouter({
  createCoupon: adminProcedure
    .input(validateCoupons)
    .mutation(async ({ input }) => {
      return await prisma.coupons.create({
        data: {
          chatInputCredits: input.chatInputCredits,
          chatOutputCredits: input.chatOutputCredits,
          transcriptionMinutes: input.transcriptionMinutes,
        },
      });
    }),

  countCoupons: adminProcedure
    .input(
      z.object({
        whereFilterList: z.any().array().optional(),
      }),
    )
    .query(async ({ input }) => {
      return await prisma.coupons.count({
        where: {
          AND: [...(input?.whereFilterList ?? [])],
        },
      });
    }),
  getCoupons: adminProcedure
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
    .query(async ({ input }) => {
      const pageSize = input.pageSize ?? 10;
      const pageIndex = input.pageIndex ?? 0;
      return await prisma.coupons.findMany({
        take: pageSize,
        skip: pageIndex * pageSize,
        where: {
          AND: [...(input?.whereFilterList ?? [])],
        },
        include: {
          subscription: {
            select: {
              user: { select: { account: { select: { email: true } } } },
            },
          },
        },
      });
    }),
  deleteCoupon: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.coupons.delete({ where: { id: input.id } });
    }),
});
