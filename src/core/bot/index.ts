import { env } from "@/config";
import { messageHandler } from "@/core/bot/handlers/message";
import { Telegraf } from "telegraf";

export const createBot = (token: string) => {
    const bot = new Telegraf(token);

    // Author only access
    bot.use((ctx, next) => {
        const username = ctx.from?.username

        console.log("ENV TOKEN:", env.TELEGRAM_BOT_TOKEN);

        if(env.TELEGRAM_ALLOWED_USER){
            if (!username || username != env.TELEGRAM_ALLOWED_USER){
                return;
            }
        }else{
            return next();
        }

        return next();
    })

    // Routing: For now, put routes in the bot directly
    // Register handlers
    bot.on('message', messageHandler)

    return bot
}