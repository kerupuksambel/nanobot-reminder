import { createBot } from "./bot";
import { TELEGRAM_BOT_TOKEN } from "./config/telegram";
import { env } from "./utils/env";

const bot = createBot(env.TELEGRAM_BOT_TOKEN)
bot.launch()