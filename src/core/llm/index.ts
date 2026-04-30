import { env } from "@/config";
import OpenAI from "openai";
import { Agent } from "./agents/base";

import { readFileSync } from "fs";
import path from "path";
import { Log } from "@/utils/log";

export class LLM {
    model: string;
    client: OpenAI;

    constructor(model: string) {
        this.model = model;

        this.client = new OpenAI({
            apiKey: env.LLM_API_KEY,
            baseURL: env.LLM_PROVIDER_URL
        });
    }

    public startConversation = async (
        chat: string,
        agents: Agent[],
    ): Promise<string> => {
        const agentsPrompt = agents
            .map(async (agent) => {
                // read agent prompt
                try {
                    const agentPrompt = readFileSync(
                        path.resolve(agent.markdownAbsPath),
                        {
                            encoding: "utf-8",
                        },
                    );

                    return agentPrompt;
                } catch {
                    // handle error on not found
                    Log.warning(
                        `${agent.name} Markdown file not found in ${agent.markdownAbsPath}. Skipping.`,
                    );
                    return "";
                }
            })
            .join("/n");

        const prompt = agentsPrompt + "\n" + chat;

        const result = await this.client.responses.create({
            model: this.model,
            input: [
                { role: "system", content: agentsPrompt },
                { role: "user", content: chat },
            ],
        });

        return result.output_text;
    };
}
