import { env } from "@/config/env";
import OpenAI from "openai";
import { Agent } from "./agents/base";

import { readFileSync } from "fs";
import path from "path";
import { Log } from "@/utils/log";
import { Service } from "typedi";
import { Chat } from "@/modules/sessions/schema";

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

        Log.debug(`[LLM] Prompt: ${chat.slice(0, 100)}... using ${model ?? env.LLM_DEFAULT_MODEL} has been started.`)
        const result = await this.client.responses.create({
            model: model ?? env.LLM_DEFAULT_MODEL,
            input: [
                { role: "system", content: agentsPrompt },
                { role: "user", content: chat },
            ],
        });

        Log.debug(`[LLM] Prompt: ${chat.slice(0, 100)}... using ${model ?? env.LLM_DEFAULT_MODEL} has been finished.`)
        Log.debug(result.output_text)

        return result.output_text;
    }

    public async continueConversation(
        chat: string,
        chatHistory: Chat[],
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

        Log.debug(`[LLM] Prompt: ${chat.slice(0, 100)}... using ${model ?? env.LLM_DEFAULT_MODEL} has been started.`)
        const result = await this.client.responses.create({
            model: model ?? env.LLM_DEFAULT_MODEL,
            input: [
                { role: "system", content: agentsPrompt },
                ...(chatHistory.map((ch) => {
                    return {
                        role: ch.sender === "user" ? "user" as const : "assistant" as const,
                        content: ch.content
                    }
                })),
                { role: "user", content: chat },
            ],
        });

        Log.debug(`[LLM] Prompt: ${chat.slice(0, 100)}... using ${model ?? env.LLM_DEFAULT_MODEL} has been finished.`)
        Log.debug(result.output_text)

        return result.output_text;
    }
}
