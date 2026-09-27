'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { refreshTokenAction } from '../actions/refreshTokenAction'
import { DEFAULT_COOKIE_MAX_AGE, ROUTES } from '../constants'

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

  useEffect(() => {
    if (!enabled) return;

    const check = async () => {
      if (isRefreshing.current) return;
      isRefreshing.current = true;

      try {
        const result = await refreshTokenAction();

        if (result.refreshed) {
          console.log('Token refreshed silently');
        } else {
          console.warn('Session expired, redirecting to /login');
          router.replace(ROUTES.LOGIN);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Silent refresh failed:', error);
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
  }, [checkInterval, enabled, router])
}