import { env } from "@/env.mjs";
import { Telegraf } from "telegraf";

const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

export const postToTelegramAnalyticsGroup = async (
  email: string,
  message: string,
) => {
  try {
    await bot.telegram.sendMessage(
      env.TELEGRAM_BOT_CHAT_ID,
      `${email} has ${message}`,
    );
  } catch (err) {
    console.error(err);
  }
};
