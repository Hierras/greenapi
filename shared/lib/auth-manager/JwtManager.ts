import 'server-only'

import jwt from 'jsonwebtoken'
import { logger } from '@/shared/lib/logger'
import { DEFAULT_COOKIE_MAX_AGE } from '@/shared/constants'

export interface LoginJWTPayload {
  apiTokenInstance: string
  idInstance: string
}

export interface GeneratedToken {
  token: string
  expiresAt: Date
  expiresIn: number // в секундах
}

export class JwtManager {
  private static readonly SECRET = process.env.JWT_SECRET!
  private static readonly DEFAULT_MAX_AGE = DEFAULT_COOKIE_MAX_AGE

  // Проверка секрета при загрузке
  static {
    if (!this.SECRET) {
      throw new Error('JWT_SECRET must be defined in environment variables')
    }
  }

  /**
   * Создаёт JWT-токен
   */
  static generate(
    payload: LoginJWTPayload,
  ): GeneratedToken {

    const clearPayload: LoginJWTPayload = {
      apiTokenInstance: payload.apiTokenInstance,
      idInstance: payload.idInstance
    }

    const token = jwt.sign(clearPayload, this.SECRET, { expiresIn: this.DEFAULT_MAX_AGE })

    // Вычисляем дату истечения
    const decoded = jwt.decode(token) as { exp: number }
    const expiresAt = new Date(decoded.exp * 1000)
    const expiresInSeconds = decoded.exp - Math.floor(Date.now() / 1000)

    logger.debug('JWT generated', {
      idInstance: payload.idInstance,
      expiresAt: expiresAt.toISOString(),
    })

    return {
      token,
      expiresAt,
      expiresIn: expiresInSeconds,
    }
  }

  /**
   * Проверяет и декодирует токен
   * @returns payload или null, если невалидный
   */
  static verify(token: string): LoginJWTPayload | null {
    try {
      const decoded = jwt.verify(token, this.SECRET) as LoginJWTPayload
      return decoded
    } catch (error) {
      logger.warn('JWT verification failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      return null
    }
  }

  /**
   * Проверяет, истёк ли токен
   */
  static isExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as { exp: number } | null
      if (!decoded?.exp) return true
      return decoded.exp * 1000 < Date.now()
    } catch {
      return true
    }
  }

  /**
   * Проверяет, валиден ли токен (подпись + срок)
   */
  static isValid(token: string): boolean {
    return this.verify(token) !== null
  }

  /**
   * Возвращает дату истечения токена
   */
  static getExpiresAt(token: string): Date | null {
    const decoded = jwt.decode(token) as { exp: number } | null
    if (!decoded?.exp) return null
    return new Date(decoded.exp * 1000)
  }

  /**
   * Возвращает стандартный maxAge (для cookies)
   */
  static getDefaultMaxAge(): number {
    return this.DEFAULT_MAX_AGE
  }
}