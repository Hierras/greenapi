"use server";

import { AuthManager } from "@/shared/lib/auth-manager";
import { GreenApi } from "@/shared/lib/green-api/GreenApi";
import logger from "@/shared/lib/logger";
import { toChatId } from "../utils/validate";

export interface CheckAccountResult {
  ok: boolean;
  chatId?: string;
  name?: string;
  error?: string;
}

export async function checkAccountAction(
  phone: string
): Promise<CheckAccountResult> {
  try {
    const instance = await AuthManager.getCurrentInstance();
    if (!instance) {
      logger.error("checkAccountAction : instance not found");
      return { ok: false, error: "Не авторизован" };
    }

    const client = new GreenApi(
      instance.apiTokenInstance,
      instance.idInstance
    );

    const res = await client.checkAccount(phone);

    if (!res.exist || !res.chatId) {
      return { ok: false, error: "Пользователь не найден" };
    }

    return {
      ok: true,
      chatId: res.chatId,
      name: res.name,
    };
  } catch (e) {
    logger.error("checkAccountAction", e);
    return { ok: false, error: "Не удалось проверить аккаунт" };
  }
}