import { createBot } from "./core/bot";
import { env } from "./config";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");
console.info("[Telegram] Initiating Telegram bot...")

const bot = createBot(env.TELEGRAM_BOT_TOKEN)
const startBot = async () => {
    for (let i = 1; i <= 5; i++) {
      try {
        await bot.launch();
        console.log("Started");
        return;
      } catch (e) {
        console.log("Retrying...", i);
        await new Promise(r => setTimeout(r, 1500));
      }
    }
    throw new Error("Failed to start bot");
  };
startBot()

console.info("[Telegram] Bot initiation succeed.")