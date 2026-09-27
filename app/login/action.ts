'use server';

import { ROUTES } from "@/shared/constants";
import { AuthManager } from "@/shared/lib/auth-manager";
import type { LoginJWTPayload } from "@/shared/lib/auth-manager/JwtManager";
import { redirect } from "next/navigation";

export async function loginAction(data: LoginJWTPayload) {
    
    /* GREN API */
    // try to get getStateInstance

    // if not 200 - send error

    // if not authorized - send warning with unknown message


    const loginResult = await AuthManager.login(data);

    redirect(ROUTES.CHAT);

    return loginResult;

}