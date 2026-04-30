import { env } from "@/config";
import { LLM } from "@/core/llm";
import TelegramBot from "node-telegram-bot-api";

export class BaseCommandHandler {
	llm: LLM | null;
	model: string;

	constructor(needsLLM: boolean = false, model: string) {
		this.llm = needsLLM ? new LLM(model ?? env.LLM_DEFAULT_MODEL) : null;
		this.model = model;
	}

	async handle(bot: TelegramBot, msg: string) {
		// Base handling logic if needed
	}
}
