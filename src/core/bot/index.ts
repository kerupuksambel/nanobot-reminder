import { Service, Inject } from "typedi";
import TelegramBot from "node-telegram-bot-api";
import { env } from "@/config/env";
import { PlanHandler } from "./handlers/commands/plan";
import { MessageHandler } from "./handlers/messages";
import { Log } from "@/utils/log";

@Service()
export class Telebot {
    private bot: TelegramBot;

    constructor(
        @Inject() private planHandler: PlanHandler,
        @Inject() private messageHandler: MessageHandler
    ) {
        this.bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, {
            polling: true,
            request: {
                agentOptions: {
                    keepAlive: true,
                    family: 4,
                },
                url: "https://api.telegram.org",
            },
        });

        this.registerHandlers();
    }

    private registerHandlers() {
        // TODO: centralize in middlewares/
        this.bot.on("message", (msg) => {
            const username = msg.from?.username;
            console.log(`Received message from ${username}: ${msg.text}`);
    
            if (env.TELEGRAM_ALLOWED_USER) {
                if (!username || username !== env.TELEGRAM_ALLOWED_USER) {
                    console.log(`[WARN] Unauthorized user ${username} attempted to interact with the bot.`);
                    return;
                }
            }
        })

        this.bot.on("message", (msg) => {
            if (msg.text && !msg.text.startsWith("/")) {
                this.messageHandler.handleMessage(this.bot, msg);
            }
        });

        this.bot.on("polling_error", (msg) => Log.error(msg.message));

        this.bot.onText(/\/create_plan(.*)/, (msg, match) => {
            this.planHandler.create(this.bot, msg, match);
        });

        Log.debug("[Telebot] Handlers registered.")
    }
}
