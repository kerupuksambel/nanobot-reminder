import TelegramBot from "node-telegram-bot-api";

export const createPlanHandler = async (bot: TelegramBot, msg: TelegramBot.Message, match: RegExpExecArray | null) => {
    const chatId = msg.chat.id;
    // Extract command parameter text if available
    const text = match ? match[1].trim() : '';

    await bot.sendMessage(chatId, `You called create, with the text = ${text}`);
}
