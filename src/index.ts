import { Telegraf } from "telegraf";
import { TELEGRAM_BOT_TOKEN } from "./config/index";

export const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply("Welcome to your coding judge bot 🚀");
});

bot.command("ping", (ctx) => {
  ctx.reply("pong");
});