"use server";

import { AuthManager } from "../lib/auth-manager"
import { CookieManager } from "../lib/auth-manager/CookieManager"
import logger from "../lib/logger";

export async function refreshTokenAction(): Promise<{
  refreshed: boolean
}> {
  try {
    const accessToken = await CookieManager.getToken();
    
    if (!accessToken) {
      return { refreshed: false }
    }

    const instance = await AuthManager.refreshToken();

    if (!instance) {
      return { refreshed: false }
    }

    return { refreshed: true }
  } catch (error) {
    logger.error(`Refresh token action failed: ${error}`);
    return { refreshed: false }
  }
}