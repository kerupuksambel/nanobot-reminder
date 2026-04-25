import TelegramBot from "node-telegram-bot-api";

export const messageHandler = async (bot: TelegramBot, msg: TelegramBot.Message) => {
    const text = msg.text || '';
    const chatId = msg.chat.id;

    await bot.sendMessage(chatId, `You sent: ${text}`);
}
