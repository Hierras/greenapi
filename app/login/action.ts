'use server';

import { ROUTES } from "@/shared/constants";
import { AuthManager } from "@/shared/lib/auth-manager";
import type { LoginJWTPayload } from "@/shared/lib/auth-manager/JwtManager";
import { GreenApi } from "@/shared/lib/green-api/GreenApi";
import logger from "@/shared/lib/logger";
import { redirect } from "next/navigation";

export async function loginAction(data: LoginJWTPayload) {
    try {
        const client =  new GreenApi(data.apiTokenInstance, data.idInstance);

        const result = await client.getStateInstance();

        if (result.stateInstance !== "authorized") {
            return {
                error: true,
                message: "Ошибка авторизации! Инстанс не авторизован!"
            }
        }

        await AuthManager.login(data);

    } catch (e) {
        logger.error("loginAction : ", e);

        return { error: true, message: "Ошибка авторизации! Попробуйте позже!" }
    }

    redirect(ROUTES.CHAT);
}