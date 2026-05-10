import { env } from "@/config";
import OpenAI from "openai";
import { Agent } from "./agents/base";

import { readFileSync } from "fs";
import path from "path";
import { Log } from "@/utils/log";
import { Service } from "typedi";

@Service()
export class LLM {
    private client: OpenAI;

    constructor() {
        this.client = new OpenAI({
            apiKey: env.LLM_API_KEY,
            baseURL: env.LLM_PROVIDER_URL
        });
    }

    public async startConversation(
        chat: string,
        agents: Agent[],
        model?: string,
    ): Promise<string> {
        const agentsPrompts = await Promise.all(
            agents.map(async (agent) => {
                try {
                    return readFileSync(
                        path.resolve(agent.markdownAbsPath),
                        { encoding: "utf-8" },
                    );
                } catch {
                    Log.warning(
                        `${agent.name} Markdown file not found in ${agent.markdownAbsPath}. Skipping.`,
                    );
                    return "";
                }
            }),
        );

        const agentsPrompt = agentsPrompts.join("\n");

        const result = await this.client.responses.create({
            model: model ?? env.LLM_DEFAULT_MODEL,
            input: [
                { role: "system", content: agentsPrompt },
                { role: "user", content: chat },
            ],
        });

        return result.output_text;
    }
}
