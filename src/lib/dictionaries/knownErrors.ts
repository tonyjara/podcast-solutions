// This is a dictionary that replaces known error with usable text messages

import { TRPCError } from "@trpc/server"

export const knownErrors = (error: string) => {
    if (error.includes("Unique constraint failed")) {
        return "The field is already in usae, please try another one."
    }

    if (error.includes("No Account found")) {
        return error
    }
    if (error.includes("User needs to wait more before new email")) {
        return error
    }

    if (error.includes("User already has a subscription")) {
        return error
    }
    if (
        error.includes(
            "Too soon to generate a new link. Please check your email."
        )
    ) {
        return error
    }

    if (error.includes("Please select an audio file before publishing")) {
        return error
    }

    if (
        error.includes(
            "You need to publish at least one non-scheduled episode to publish the podcast"
        )
    ) {
        return error
    }

    if (error.includes("Captcha failed")) {
        return "Captcha failed, please try again."
    }

    if (error.includes("Email already verified.")) {
        return "Email already verified, please login"
    }

    if (error.includes("Coupon not found or already claimed")) {
        return error
    }

    if (error.includes("Not enough transcription minutes")) {
        return "Not enough transcription minutes, please subscribe to a plan."
    }

    if (error.includes("Not enough chat credits")) {
        return "Not enough chat credits, please subscribe to a plan."
    }

    if (
        error.includes(
            "You have already sent a support ticket, please wait a few minutes before sending another one."
        )
    ) {
        return error
    }
    console.error(error)
    return "Something went wrong, please try again."
}

export const throwInternalServerError: (x: string) => never = (
    error: string
) => {
    throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: error,
    })
}
