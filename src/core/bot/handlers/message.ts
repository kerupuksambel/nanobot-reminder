import { Context } from "telegraf";

export const messageHandler = async (ctx: Context) => {
    const text = ctx.text 

    await ctx.reply(`You sent: ${text}`)
}