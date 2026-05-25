import { text } from "drizzle-orm/sqlite-core";
import { integer } from "drizzle-orm/sqlite-core";
import { sqliteTable } from "drizzle-orm/sqlite-core";

export interface Chat {
    sender: string,
    content: string
}

export enum SessionStatus {
    IN_PROGRESS = 'in_progress',
    CANCELLED = 'cancelled',
    DONE = 'done'
}

export const Session = sqliteTable("sessions", {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    chats: text("chats", {mode: 'json'}).$type<Chat[]>().notNull(),
    status: text("status", { enum: Object.values(SessionStatus) as [string, ...string[]]}).notNull().default(SessionStatus.IN_PROGRESS),
    createdAt: integer("created_at", {mode: 'timestamp'}).$defaultFn(() => new Date())
})