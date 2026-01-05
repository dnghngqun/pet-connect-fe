'use client';

import { useTokenRefresh } from '@/hooks/useTokenRefresh';

export default function AuthManager() {
  useTokenRefresh();
  return null;
}
