'use client';

import { useEffect } from 'react';
import authService from '@/services/authService';

export function useTokenRefresh() {
  useEffect(() => {

    const user = authService.getCurrentUser();
    if (!user) return;

    const REFRESH_INTERVAL = 14 * 60 * 1000; 

    const intervalId = setInterval(async () => {

      if (authService.getCurrentUser()) {
        console.log('Refreshing token...');
        await authService.refreshToken();
      } else {
        clearInterval(intervalId);
      }
    }, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, []);
}
