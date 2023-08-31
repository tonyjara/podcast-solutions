// This is a dictionary that replaces known error with usable text messages

import { createServerLog } from "@/server/serverUtils";
import { TRPCError } from "@trpc/server";

export const knownErrors = (error: string) => {
  if (error.includes("Unique constraint failed")) {
    return "The field is already in usae, please try another one.";
  }

  if (error.includes("No Account found")) {
    return error;
  }
  if (error.includes("User needs to wait more before new email")) {
    return error;
  }

  if (error.includes("User already has a subscription")) {
    return error;
  }
  if (
    error.includes("Too soon to generate a new link. Please check your email.")
  ) {
    return error;
  }

  if (error.includes("Please select an audio file before publishing")) {
    return error;
  }

  if (
    error.includes(
      "You need to publish at least one non-scheduled episode to publish the podcast",
    )
  ) {
    return error;
  }

  if (error.includes("Captcha failed")) {
    return "Captcha failed, please try again.";
  }

  console.error(error);
  return "Something went wrong, please try again.";
};

export const throwInternalServerError: (x: string) => never = (
  error: string,
) => {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: error,
  });
};
