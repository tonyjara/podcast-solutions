// This is a dictionary that replaces known error with usable text messages

import { TRPCError } from "@trpc/server";

export const knownErrors = (error: string) => {
  if (error.includes("Unique constraint failed")) {
    return "This field already exists, please try again.";
  }

  if (error.includes("No Account found")) {
    return "No account found with this email, please try again.";
  }
  if (error.includes("User needs to wait more before new email")) {
    return "You need to wait more before sending another request, please try again later.";
  }

  if (error.includes("User already has a subscription")) {
    return "You already have a subscription, please contact support.";
  }
  if (
    error.includes("Too soon to generate a new link. Please check your email.")
  ) {
    return "Too soon to generate a new link. Please check your email.";
  }

  if (error.includes("Captcha failed")) {
    return "Captcha failed, please try again.";
  }

  console.error(error);
  return "There was an error, please try again.";
};

export const throwInternalServerError: (x: string) => never = (
  error: string,
) => {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error,
  });
};
