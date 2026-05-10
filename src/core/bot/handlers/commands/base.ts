import { Inject } from "typedi";
import { LLM } from "@/core/llm";

export class CommandHandlerBase {
	@Inject()
	llm!: LLM;
}
