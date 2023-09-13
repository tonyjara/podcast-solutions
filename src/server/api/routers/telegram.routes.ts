import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc"
import { Telegraf } from "telegraf"
import { env } from "@/env.mjs"
import { z } from "zod"

const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN)

//  log this and paste the url on the browser to get your chatId
/* const botGetUpdatesUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/getUpdates`; */

export const telegramRouter = createTRPCRouter({
    postToAnalyticsGroup: protectedProcedure
        .input(
            z.object({
                message: z.string().min(1),
            })
        )
        .query(async ({ input, ctx }) => {
            const user = ctx.session.user
            await bot.telegram.sendMessage(
                env.TELEGRAM_BOT_CHAT_ID,
                `${user.email} has ${input.message}`
            )
        }),
})
