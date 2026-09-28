'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { refreshTokenAction } from '../actions/refreshTokenAction'
import { DEFAULT_COOKIE_MAX_AGE, ROUTES } from '../constants'
import logger from '../lib/logger'

interface UseTokenRefreshOptions {
  checkInterval?: number
  enabled?: boolean
}

export function useTokenRefresh({
  checkInterval = (DEFAULT_COOKIE_MAX_AGE - 30) * 1000, // за 30 сек до истечения
  enabled = true,
}: UseTokenRefreshOptions = {}) {
  const isRefreshing = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;

    const check = async () => {
      if (isRefreshing.current) return;
      isRefreshing.current = true;

      try {
        const result = await refreshTokenAction();

        if (result.refreshed) {
          if (pathname !== ROUTES.CHAT) {
            router.replace(ROUTES.CHAT);
          }
        } else {
          logger.warn('Session expired, redirecting to /login');
          router.replace(ROUTES.LOGIN);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          logger.error('Silent refresh failed:', error);
        }
      } finally {
        isRefreshing.current = false;
      }
    }

    check();

    const interval = setInterval(check, checkInterval);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        check();
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    }
  }, [checkInterval, enabled, router, pathname])
}