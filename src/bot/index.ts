import { Telegraf } from "telegraf";

export const createBot = (token: string) => {
    const bot = new Telegraf(token);

    bot.start((ctx) => {
        ctx.reply("Welcome to your coding judge bot 🚀");
    });

    bot.command("ping", (ctx) => {
        ctx.reply("pong");
    });

    return bot
}