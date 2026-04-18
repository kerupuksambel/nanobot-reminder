import { createBot } from "./core/bot";
import { env } from "./config";

console.info("[Telegram] Initiating Telegram bot...")

const bot = createBot(env.TELEGRAM_BOT_TOKEN)
bot.launch()

console.info("[Telegram] Bot initiation succeed.")