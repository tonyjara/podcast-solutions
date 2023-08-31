import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { subMinutes } from "date-fns";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { makeSignedToken } from "./routeUtils/VerificationLinks.routeUtils";
import { prisma } from "@/server/db";
import { validateSignup } from "@/components/Validations/signup.validate";
import {
  sendPasswordRecoveryEmail,
  sendVerificationEmail,
} from "@/server/mailersend/mailersend";
import { z } from "zod";
import { verifyToken } from "@/lib/utils/asyncJWT";
import { validatePasswordRecovery } from "@/pages/forgot-my-password/[link]";
import { validateRecaptcha } from "@/server/serverUtils";

export const magicLinksRouter = createTRPCRouter({
  generateVerificationLink: publicProcedure
    .input(validateSignup)
    .mutation(async ({ input }) => {
      //Check if there's a verification link that was created in the last 5 minutes
      // and if so return message that a link was already generated and to check email
      // and if not then generate a new link and return it

      await validateRecaptcha(input.reCaptchaToken);

      const prevLink = await prisma.accountVerificationLinks.findFirst({
        where: {
          email: input.email,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      if (prevLink && prevLink.createdAt > subMinutes(new Date(), 5)) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Too soon to generate a new link. Please check your email.",
        });
      }
      if (prevLink && prevLink.hasBeenUsed) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Email already verified. Please login.",
        });
      }

      const secret = process.env.JWT_SECRET;
      const uuid = uuidv4();
      if (!secret) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No secret",
        });
      }
      const signedToken = makeSignedToken({
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        uuid,
        secret,
      });
      const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;
      const link = `${baseUrl}/verify/${signedToken}`;

      const verificationLink = await prisma?.accountVerificationLinks.create({
        data: {
          id: uuid,
          verificationLink: link,
          email: input.email,
        },
      });
      const isDevEnv = process.env.NODE_ENV === "development";
      if (!isDevEnv) {
        await sendVerificationEmail({
          email: input.email,
          name: `${input.firstName} ${input.lastName}`,
          link,
        });
      }
      if (isDevEnv) {
        console.info("Verification Link: ", link);
      }

      return { status: "successs", sentAt: verificationLink.createdAt };
    }),

  createLinkForPasswordRecovery: publicProcedure
    .input(z.object({ email: z.string().email(), reCaptchaToken: z.string() }))
    .mutation(async ({ input }) => {
      await validateRecaptcha(input.reCaptchaToken);

      const account = await prisma.account.findUniqueOrThrow({
        where: { email: input.email, active: true },
        include: { user: true },
      });
      if (!account.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User not found",
        });
      }

      const fetchedUser = account.user;
      //find if there was a password created in the last 5 minutes
      const freshPassLink = await prisma.passwordRecoveryLinks.findFirst({
        where: { createdAt: { gte: subMinutes(new Date(), 5) } },
      });
      if (!!freshPassLink) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "User needs to wait more before new email",
        });
      }

      const secret = process.env.JWT_SECRET;
      const uuid = uuidv4();
      if (!secret) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No secret or selectedOrg.",
        });
      }
      const signedToken = makeSignedToken({
        firstName: fetchedUser.firstName,
        lastName: fetchedUser.lastName,
        email: account.email,
        uuid,
        secret,
      });
      const baseUrl = process.env.NEXT_PUBLIC_WEB_URL;

      const link = `${baseUrl}/forgot-my-password/${signedToken}`;

      await prisma.passwordRecoveryLinks.create({
        data: {
          id: uuid,
          recoveryLink: link,
          email: input.email.toLowerCase(),
          accountId: account.id,
        },
      });

      await sendPasswordRecoveryEmail({
        email: input.email.toLowerCase(),
        name: fetchedUser.firstName,
        link,
      });
    }),

  assignPasswordFromRecovery: publicProcedure
    .input(validatePasswordRecovery)
    .mutation(async ({ input }) => {
      const secret = process.env.JWT_SECRET;

      if (!secret) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No secret.",
        });
      }

      const handleToken = await verifyToken(input.token, secret);

      const getLink = await prisma?.passwordRecoveryLinks.findUnique({
        where: { id: input.linkId },
      });
      if (getLink?.hasBeenUsed) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Link already used.",
        });
      }

      const hashedPass = await bcrypt.hash(input.password, 10);

      if (handleToken && "data" in handleToken) {
        // makes sure all links are invalidated
        await prisma?.passwordRecoveryLinks.updateMany({
          where: { email: input.email.toLowerCase() },
          data: { hasBeenUsed: true },
        });

        return prisma?.account.update({
          where: { email: input.email.toLowerCase() },
          data: { password: hashedPass },
        });
      } else {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Token invalid.",
        });
      }
    }),
});
