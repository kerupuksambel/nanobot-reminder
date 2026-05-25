import { text } from "drizzle-orm/sqlite-core";
import { integer } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export const User = sqliteTable("sessions", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    username: text("username"),
    activeSessionID: integer("session_id"),
})