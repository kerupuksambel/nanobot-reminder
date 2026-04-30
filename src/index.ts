import { createBot } from "./core/bot";
import { env } from "./config";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
console.info("[Telegram] Initiating Telegram bot...");

// In-memory
let bot;

const startBot = async () => {
    for (let i = 1; i <= 10; i++) {
        try {
            // node-telegram-bot-api starts automatically with polling
            bot = createBot(env.TELEGRAM_BOT_TOKEN);
            console.log("Started");
            return;
        } catch (e) {
            console.log(`Error upon ${i} tries, reason: ${e}`);
            console.log("Retrying...", i);
            await new Promise((r) => setTimeout(r, 1500));
        }
    }
    throw new Error("Failed to start bot");
};
startBot();

console.info("[Telegram] Bot initiation succeed.");
