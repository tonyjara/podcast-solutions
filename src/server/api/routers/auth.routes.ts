import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import bcrypt from "bcryptjs";
import { randomAvatar } from "@/lib/Constants";
import { validateVerify } from "@/components/Validations/verify.validate";

export const authRouter = createTRPCRouter({
  signup: publicProcedure.input(validateVerify).mutation(async ({ input }) => {
    const hashedPass = await bcrypt.hash(input.password, 10);

    const account = await prisma.account.create({
      data: {
        email: input.email,
        password: hashedPass,
        isVerified: true,
      },
    });
    await prisma.user.create({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        image: randomAvatar(),
        account: {
          connect: {
            id: account.id,
          },
        },
      },
    });
    await prisma.accountVerificationLinks.updateMany({
      where: { id: input.linkId },
      data: { hasBeenUsed: true },
    });
  }),
});
