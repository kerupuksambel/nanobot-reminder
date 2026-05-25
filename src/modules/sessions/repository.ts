import { db } from "@/infras/db"
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import { Chat, Session } from "./schema"
import { eq } from "drizzle-orm"
import { Log } from "@/utils/log"

export class SessionRepository {
    
    private db: BetterSQLite3Database
    
    constructor(){
        this.db = db
    }

    async addSession(){
        const session = await this.db.insert(Session).values({
            chats: []
        })

        return session.lastInsertRowid
    }

    async addChat(sessionID: number | bigint, chat: Chat){
        const session = await this.getSession(sessionID)
        const existingChats = session.chats

        const res = await this.db.update(Session).set({
            chats: [
                ...existingChats,
                chat
            ]
        }).where(eq(Session.id, Number(sessionID)))
    }

    async getSession(sessionID: number | bigint){
        const sessions = await this.db.select().from(Session).where(eq(Session.id, Number(sessionID)))

        if(!sessions || sessions.length == 0){
            Log.warning("[DB] No session is defined. Passing DB actions...")
        }

        return sessions[0]
    }
}