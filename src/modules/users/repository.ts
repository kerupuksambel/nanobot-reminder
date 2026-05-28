import { db } from "@/infras/db"
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3"
import { eq } from "drizzle-orm"
import { Log } from "@/utils/log"
import { User } from "../users/schema"
import { Service } from "typedi"

@Service()
export class UserRepository {
    
    private db: BetterSQLite3Database
    
    constructor(){
        this.db = db
    }

    async updateUserSession(username: string, sessionID: number | bigint){
        const res = await this.db.update(User).set({
            activeSessionID: Number(sessionID)
        }).where(eq(User.username, username))

        return res.changes
    }

    async getUser(username: string){
        const user = await this.db.select().from(User).where(eq(User.username, username))
        
        if(!user || user.length == 0){
            Log.warning("[DB] No session is defined. Passing DB actions...")
            return null;
        }

        return user[0]
    }

    async addUser(username: string){
        const user = await this.db.insert(User).values({
            username
        })

        return user.lastInsertRowid
    }
}