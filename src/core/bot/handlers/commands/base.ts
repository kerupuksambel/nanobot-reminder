import TelegramBot from "node-telegram-bot-api";

export class BaseCommandHandler {

    // llm: 

    constructor(needsLLM: boolean = false) {
        // this.llm = needsLLM ? this.initializeLLM() : null;
    }

    async handle(bot: TelegramBot, msg: string) {
        // Base handling logic if needed
    }
}