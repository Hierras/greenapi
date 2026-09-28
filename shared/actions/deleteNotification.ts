"use server";

import { AuthManager } from "../lib/auth-manager";
import { GreenApi } from "../lib/green-api/GreenApi";
import type { DeleteNotificationResponse } from "../lib/green-api/types";
import logger from "../lib/logger";

export interface DeleteNotificationArgs {
    receiptId: number;
}

export async function deleteNotification({
    receiptId,
}: DeleteNotificationArgs): Promise<DeleteNotificationResponse | null> {

    const instance = await AuthManager.getCurrentInstance();
    if (!instance) {
        logger.error("deleteNotification : instance not found");
        return null;
    }

    const { apiTokenInstance, idInstance } = instance;

    const api = new GreenApi(apiTokenInstance, idInstance);
    return api.deleteNotification(receiptId);
}