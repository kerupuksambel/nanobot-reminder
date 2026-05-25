
import { defineConfig } from "drizzle-kit";
import { env } from "@/config/env";

export default defineConfig({
    schema: [
        './src/modules/sessions/schema.ts'
    ],
    out: './src/migrations',
    dialect: "sqlite",
    dbCredentials: {
        url: env.DB_FILE,
    },
});
