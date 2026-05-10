import "reflect-metadata";
import { Container } from "typedi";
import { LLM } from "./core/llm";
import { Log } from "./utils/log";
import dns from "node:dns";
import { Telebot } from "./core/bot";

dns.setDefaultResultOrder("ipv4first");

const start = async () => {
    // Init LLM once — validates env config
    Container.get(LLM);
    Log.info("[LLM] Initialized");

    for (let i = 1; i <= 10; i++) {
        try {
            Container.get(Telebot);
            Log.info("[Telegram] Bot started");
            return;
        } catch (e) {
            Log.error(`[Telegram] Start failed (${i}/10): ${e}`);
            if (i < 10) {
                await new Promise((r) => setTimeout(r, 1500));
            }
        }
    }

    throw new Error("Failed to start bot after 10 retries");
};

start();
