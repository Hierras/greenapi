"use server";

import { AuthManager } from "@/shared/lib/auth-manager";
import { GreenApi } from "@/shared/lib/green-api/GreenApi";
import { logger } from "@/shared/lib/logger";
import { toChatId } from "../utils/validate";

export interface SendMessageResult {
  ok: boolean;
  idMessage?: string;
  error?: string;
}

export async function sendMessageAction(
  phone: string,
  text: string
): Promise<SendMessageResult> {
  try {
    const instance = await AuthManager.getCurrentInstance();
    if (!instance) {
      logger.error("sendMessageAction : instance not found");
      return { ok: false, error: "Не авторизован" };
    }

    const chatId = toChatId(phone);
    if (!chatId) {
      return { ok: false, error: "Некорректный номер" };
    }

    const trimmed = text.trim();
    if (!trimmed) {
      return { ok: false, error: "Пустое сообщение" };
    }

    const client = new GreenApi(
      instance.apiTokenInstance,
      instance.idInstance
    );

    const res = await client.sendMessage(chatId, trimmed);

    return { ok: true, idMessage: res.idMessage };
  } catch (e) {
    logger.error("sendMessageAction", e);
    return { ok: false, error: "Не удалось отправить сообщение" };
  }
}