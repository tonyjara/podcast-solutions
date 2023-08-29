import { PlanType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { prisma } from "./db";

export const validateRecaptcha = async (reCaptchaToken: string) => {
  const captchaV2Secret = process.env.RE_CAPTCHA_SECRET_KEY;

  const result = await fetch(
    `https://www.google.com/recaptcha/api/siteverify?secret=${captchaV2Secret}&response=${reCaptchaToken}`,
    {
      method: "POST",
    },
  );
  const captcha = await result.json();
  if (!captcha.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid Captcha",
    });
  }
};

export const initializePlanCredits = async ({
  planType,
  subscriptionId,
}: {
  planType: PlanType;
  subscriptionId: string;
}) => {
  if (planType === "FREE") {
  }

  if (planType === "HOBBY") {
    await prisma.subscriptionCreditsActions.create({
      data: {
        subscriptionId,
        currentAmount: 50000,
        tag: "CHAT_INPUT",
      },
    });

    await prisma.subscriptionCreditsActions.create({
      data: {
        subscriptionId,
        currentAmount: 50000,
        tag: "CHAT_OUTPUT",
      },
    });

    await prisma.subscriptionCreditsActions.create({
      data: {
        subscriptionId,
        currentAmount: 60,
        tag: "TRANSCRIPTION_MINUTE",
      },
    });
  }

  if (planType === "BASIC") {
    await prisma.subscriptionCreditsActions.create({
      data: {
        subscriptionId,
        currentAmount: 200000,
        tag: "CHAT_INPUT",
      },
    });

    await prisma.subscriptionCreditsActions.create({
      data: {
        subscriptionId,
        currentAmount: 200000,
        tag: "CHAT_OUTPUT",
      },
    });

    await prisma.subscriptionCreditsActions.create({
      data: {
        subscriptionId,
        currentAmount: 240,
        tag: "TRANSCRIPTION_MINUTE",
      },
    });
  }

  if (planType === "PRO") {
    await prisma.subscriptionCreditsActions.create({
      data: {
        subscriptionId,
        currentAmount: 500000,
        tag: "CHAT_INPUT",
      },
    });

    await prisma.subscriptionCreditsActions.create({
      data: {
        subscriptionId,
        currentAmount: 500000,
        tag: "CHAT_OUTPUT",
      },
    });

    await prisma.subscriptionCreditsActions.create({
      data: {
        subscriptionId,
        currentAmount: 720,
        tag: "TRANSCRIPTION_MINUTE",
      },
    });
  }
};
