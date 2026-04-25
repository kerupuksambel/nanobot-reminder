import { env } from "@/config";
import { messageHandler } from "@/core/bot/handlers/messages";
import TelegramBot from "node-telegram-bot-api";
import { createPlanHandler } from "./handlers/commands/plan";

import https from "node:https";
import dns from "node:dns";

let lastGoodIP: string | null = null;


export const createBot = (token: string) => {
    // Set polling to true for long polling
    const bot = new TelegramBot(
            token, 
            { 
                polling: true, 
                request: {
                    agentOptions: {
                    keepAlive: true,
                    family: 4
                },
                url: 'https://api.telegram.org'
            }
        }
    );
    
    // Author only access - filtering messages by username
    bot.on('message', (msg) => {
        const username = msg.from?.username;
        
        console.log("ENV TOKEN:", env.TELEGRAM_BOT_TOKEN);

        if(env.TELEGRAM_ALLOWED_USER){
            if (!username || username != env.TELEGRAM_ALLOWED_USER){
                return; // Ignore messages from unauthorized users
            }
        }
    });

    // Register handlers for all message types
    bot.on('message', (msg) => {
        // Only process text messages
        if (msg.text && !msg.text.startsWith('/')) {
            messageHandler(bot, msg);
        }
    });

    // Planning phase - command handler
    bot.onText(/\/create_plan(.*)/, (msg, match) => {
        createPlanHandler(bot, msg, match);
    });
    
    // Submission phase
    // bot.onText(/\/create_repo(.*)/, (msg, match) => createRepoHandler(bot, msg, match));
    // bot.onText(/\/submit_repo(.*)/, (msg, match) => submitRepoHandler(bot, msg, match));

    // // Menu
    // bot.onText(/\/plans(.*)/, (msg, match) => readPlansHandler(bot, msg, match));
    // bot.onText(/\/plan_details(.*)/, (msg, match) => readPlanDetailsHandler(bot, msg, match));
    // bot.onText(/\/plan_support(.*)/, (msg, match) => requestSupportHandler(bot, msg, match));
    
    // // Cancel current phase
    // bot.onText(/\/cancel(.*)/, (msg, match) => dropPhaseHandler(bot, msg, match));

    return bot;
}
