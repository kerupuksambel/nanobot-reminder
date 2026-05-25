import { LLM } from "@/core/llm";
import { db } from "@/infras/db";
import { SessionRepository } from "@/modules/sessions/repository";
import { Log } from "@/utils/log";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import TelegramBot from "node-telegram-bot-api";
import Container, { Inject, Service } from "typedi";

@Service()
export class MessageHandler {
    private db: BetterSQLite3Database
    private sessionRepository: SessionRepository
    
    @Inject()
    private llm!: LLM

    constructor(){
        this.db = db
        this.sessionRepository = Container.get(SessionRepository) 
    }

    async handleMessage(bot: TelegramBot, msg: TelegramBot.Message) {
        // Get username and running session
        const username = msg.from?.username
        var session;

        if(!username){
            Log.warning("[Bot] No username detected. No context retention applied.")
            session = null
        }else{
            session = await this.sessionRepository.getUserSession(username)
        }
    
    
        const text = msg.text || '';
        const chatId = msg.chat.id;

        if(session){
            await this.sessionRepository.addChat(session.id, {
                sender: "user",
                content: text
            })
        }

        await bot.sendMessage(chatId, `You sent: ${text}`);
    }
}