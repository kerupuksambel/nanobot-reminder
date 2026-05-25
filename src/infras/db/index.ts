import { env } from "@/config/env";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";

const dbPath = path.resolve(env.DB_FILE);

// Create data dir if not exist
mkdirSync(path.dirname(dbPath), { recursive: true });

const client = new Database(dbPath);
export const db = drizzle(client);
