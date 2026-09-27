import 'server-only'

import { cookies } from 'next/headers'
import { logger } from '@/shared/lib/logger'
import { COOKIE_NAMES } from './constants'
import { DEFAULT_COOKIE_MAX_AGE } from '@/shared/constants'

export type CookieName = typeof COOKIE_NAMES[keyof typeof COOKIE_NAMES]

interface SetCookieOptions {
  maxAge?: number
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  path?: string
}

export class CookieManager {
  private static readonly DEFAULT_OPTIONS: Required<SetCookieOptions> = {
    maxAge: DEFAULT_COOKIE_MAX_AGE,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  }
  
  /**
   * Устанавливает cookie
   */
  static async set(
    name: string,
    value: string | number,
    options: SetCookieOptions = {}
  ): Promise<void> {
    const cookieStore = await cookies()
    
    const validatedValue = typeof value === "string" ? value : String(value);

    cookieStore.set(name, validatedValue, {
      ...this.DEFAULT_OPTIONS,
      ...options,
    })

    logger.debug(`Cookie "${name}" set`, { maxAge: options.maxAge })
  }

  /**
   * Устанавливает JWT cookie
   */
  static async setToken(
    token: string, 
    maxAge: number = this.DEFAULT_OPTIONS.maxAge
  ): Promise<void> {
    await this.set(COOKIE_NAMES.TOKEN, token, { maxAge })
  }

  /**
   * Читает cookie по имени
   */
  static async get(name: string): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get(name)?.value ?? null
  }

  /**
   * Читает JWT cookie
   */
  static async getToken(): Promise<string | null> {
    return this.get(COOKIE_NAMES.TOKEN)
  }

  /**
   * Проверяет существование cookie
   */
  static async has(name: string): Promise<boolean> {
    const value = await this.get(name)
    return value !== null
  }

  /**
   * Удаляет cookie по имени
   */
  static async remove(name: string): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete(name)
    logger.debug(`Cookie "${name}" removed`)
  }

  /**
   * Удаляет JWT cookie
   */
  static async removeToken(): Promise<void> {
    await this.remove(COOKIE_NAMES.TOKEN)
  }

  /**
   * Удаляет все auth cookies
   */
  static async removeAll(): Promise<void> {
    await this.removeToken()
    logger.debug('All auth cookies removed')
  }

  
  /**
   * Возвращает все cookies
   */
  static async getAll(): Promise<Record<string, string>> {
    const cookieStore = await cookies()
    return cookieStore.getAll().reduce((acc, cookie) => {
      acc[cookie.name] = cookie.value
      return acc
    }, {} as Record<string, string>)
  }
}