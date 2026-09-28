"use server";

import { AuthManager } from "../lib/auth-manager";
import { GreenApi } from "../lib/green-api/GreenApi";
import type { ReceiveNotificationResponse } from "../lib/green-api/types";
import logger from "../lib/logger";

export interface ReceiveNotificationArgs {
    receiveTimeout?: number;
}

/**
 * Один запрос receiveNotification.
 * Возвращает null, если очередь пуста (таймаут истёк).
 */
export async function receiveNotification({
    receiveTimeout = 5,
}: ReceiveNotificationArgs): Promise<ReceiveNotificationResponse | null> {

    const instance = await AuthManager.getCurrentInstance();
    if (!instance) {
        logger.error("receiveNotification : instance not found");
        return null;
    }
    
    const { apiTokenInstance, idInstance } = instance;

    const api = new GreenApi(apiTokenInstance, idInstance);
    return api.receiveNotification(receiveTimeout);
}