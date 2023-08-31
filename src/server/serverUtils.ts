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

export const createServerLog = async (
  message: string,
  level: string,
  eventId?: string,
) => {
  await prisma.logs.create({
    data: {
      message: message,
      level,
      eventId: eventId ?? "NONE",
    },
  });
};
