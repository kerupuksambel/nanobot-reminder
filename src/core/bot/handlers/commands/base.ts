import { env } from "@/config";
import { LLM } from "@/core/llm";
import { Inject } from "typedi";

export class CommandHandlerBase {
	@Inject()
	llm: LLM;
	
	model: string;

	constructor(model?: string) {
		this.llm = new LLM(model ?? env.LLM_DEFAULT_MODEL);
		this.model = model ?? env.LLM_DEFAULT_MODEL;
	}
}
