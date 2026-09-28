"use server";

import { AuthManager } from "@/shared/lib/auth-manager";
import { GreenApi } from "@/shared/lib/green-api/GreenApi";
import logger from "@/shared/lib/logger";

export async function getMessagesAction(chatId: string, count: number = 100) {
    try {
        const instance = await AuthManager.getCurrentInstance();
        if (!instance) {
            logger.error("getMessagesAction : instance not found");
            return null;
        }

        const client = new GreenApi(
            instance.apiTokenInstance,
            instance.idInstance
        );

        const history = await client.getChatHistory(chatId, count);
        return history;
    } catch (e) {
        logger.error("getMessagesAction", e);
        return null;
    }
}