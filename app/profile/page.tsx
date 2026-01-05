'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import authService from '@/services/authService';
import { Loader2 } from 'lucide-react';

export default function MyProfilePage() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getCurrentUser();
      if (user && user.id) {
        router.replace(`/profile/${user.id}`);
      } else {
        router.replace('/sign-in');
      }
    };
    
    checkAuth();
  }, [router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Đang chuyển hướng đến trang cá nhân...</p>
      </div>
    </div>
  );
}
