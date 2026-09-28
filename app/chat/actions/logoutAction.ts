"use server";

import { ROUTES } from "@/shared/constants";
import { AuthManager } from "@/shared/lib/auth-manager";
import { redirect } from "next/navigation";

export async function logoutAction() {
    await AuthManager.logout();

    redirect(ROUTES.LOGIN);
}