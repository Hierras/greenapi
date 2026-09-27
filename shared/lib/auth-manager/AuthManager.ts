import 'server-only'

import { JwtManager, type LoginJWTPayload } from './JwtManager'
import { CookieManager } from './CookieManager'
import { logger } from '@/shared/lib/logger'

export interface AuthSession {
  instance: LoginJWTPayload
  expiresAt: Date
}

export interface LoginResult {
  instance: LoginJWTPayload
  expiresAt: Date
}

export class AuthManager {

  /**
   * Авторизует пользователя: генерирует токен + ставит cookies
   */
  static async login(payload: LoginJWTPayload): Promise<LoginResult> {
    const { token, expiresAt, expiresIn } = JwtManager.generate(payload)

    await CookieManager.setToken(token, expiresIn);

    logger.info('Instance logged in', {
      instatnceId: payload.idInstance,
      expiresAt: expiresAt.toISOString(),
    })

    return {
      instance: payload,
      expiresAt,
    }
  }

  /**
   * Выход: удаляет все auth cookies
   */
  static async logout(): Promise<void> {
    await CookieManager.removeAll()
    logger.info('Instance logged out')
  }

  /**
   * Получает текущего instance из cookie
   * @returns payload или null, если не авторизован
   */
  static async getCurrentInstance(): Promise<LoginJWTPayload | null> {
    const token = await CookieManager.getToken()
    
    if (!token) {
      return null
    }

    const payload = JwtManager.verify(token)
    
    if (!payload) {
      await CookieManager.removeToken()
      return null
    }

    return payload
  }

  /**
   * Получает полную сессию (instance + expiresAt)
   */
  static async getSession(): Promise<AuthSession | null> {
    const token = await CookieManager.getToken()
    
    if (!token) return null

    const instance = JwtManager.verify(token)
    if (!instance) {
      await CookieManager.removeToken()
      return null
    }

    const expiresAt = JwtManager.getExpiresAt(token)
    if (!expiresAt) return null

    return { instance, expiresAt }
  }

  /**
   * Проверяет, авторизован ли пользователь
   */
  static async isAuthenticated(): Promise<boolean> {
    const instance = await this.getCurrentInstance()
    return instance !== null
  }

  /**
   * Требует авторизации или выбрасывает ошибку
   */
  static async requireAuth(): Promise<LoginJWTPayload> {
    const instance = await this.getCurrentInstance()
    
    if (!instance) {
      throw new Error('Unauthorized: No valid token found')
    }

    return instance
  }

  
  /**
   * Обновляет токен на основе текущего (берёт payload из cookie)
   */
  static async refreshToken(): Promise<LoginResult | null> {
    const currentToken = await CookieManager.getToken();
    
    if (!currentToken) {
      logger.warn('No token to refresh')
      return null
    }

    const payload = JwtManager.verify(currentToken);
    
    if (!payload) {
      logger.warn('Invalid token, cannot refresh');
      await CookieManager.removeToken();
      return null
    }

    const { token, expiresAt } = JwtManager.generate(payload);
    
    await CookieManager.setToken(token);

    logger.debug('Token refreshed', { userId: payload.idInstance });

    return {
      instance: payload,
      expiresAt,
    }
  }

  /**
   * Проверяет, скоро ли истечёт токен (меньше 1 дня)
   */
  static async shouldRefresh(): Promise<boolean> {
    const session = await this.getSession()
    if (!session) return false

    const oneDayMs = 24 * 60 * 60 * 1000
    const timeLeft = session.expiresAt.getTime() - Date.now()

    return timeLeft < oneDayMs
  }
}