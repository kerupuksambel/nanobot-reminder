import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const FALLBACK_MODEL = "moonshotai/kimi-k2.6";

const envSchema = z.object({
	TELEGRAM_BOT_TOKEN: z.string().min(1),
	TELEGRAM_ALLOWED_USER: z.string().optional(),

	LLM_API_KEY: z.string().min(1),
	LLM_PROVIDER_URL: z.string().min(1),
	LLM_DEFAULT_MODEL: z.string().optional().default(FALLBACK_MODEL),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	console.error("Invalid environment variables:");
	console.error(parsedEnv.error);
	process.exit(1);
}

export const env = parsedEnv.data;
