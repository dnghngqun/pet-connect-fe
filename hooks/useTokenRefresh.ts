'use client';

import { useEffect } from 'react';
import authService from '@/services/authService';

export function useTokenRefresh() {
  useEffect(() => {
    // Check if user is logged in
    const user = authService.getCurrentUser();
    if (!user) return;

    // Refresh every 14 minutes (assuming 15 min expiration)
    // 14 * 60 * 1000 = 840000 ms
    const REFRESH_INTERVAL = 14 * 60 * 1000; 

    const intervalId = setInterval(async () => {
      // Check again if user is logged in to avoid refreshing after logout
      if (authService.getCurrentUser()) {
        console.log('Refreshing token...');
        await authService.refreshToken();
      } else {
        clearInterval(intervalId);
      }
    }, REFRESH_INTERVAL);

    // Initial refresh check? No, let's start counting.
    // Ideally we should check expiration time but blind interval is requested for simplicity.

    return () => clearInterval(intervalId);
  }, []);
}
