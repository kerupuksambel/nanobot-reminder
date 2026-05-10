import TelegramBot from "node-telegram-bot-api";
import { CommandHandlerBase } from "./base";
import { Service } from "typedi";


@Service()
export class PlanHandler extends CommandHandlerBase {
    constructor(){
        super()
    }

    public create = async (bot: TelegramBot, msg: TelegramBot.Message, match: RegExpExecArray | null) => {
        const chatId = msg.chat.id;
        // Extract command parameter text if available
        const text = match ? match[1].trim() : '';

        const response = await this.llm.startConversation("Please reply this message with ONLY your model name.", [])
    
        await bot.sendMessage(chatId, `You called create, with the text = ${text}. LLM response: ${response}`);
    }
}

