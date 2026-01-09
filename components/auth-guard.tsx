
"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
const PUBLIC_PATHS = [
  "/sign-in",
  "/sign-up", 
  "/forgot-password"
];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {

    if (isLoading) return;
    const isPublicPath = PUBLIC_PATHS.some(path => pathname?.startsWith(path));

    if (!user && !isPublicPath) {
      const returnUrl = encodeURIComponent(pathname || '/');
      router.push(`/sign-in?returnUrl=${returnUrl}`);
      setIsAuthorized(false);
    } else if (user && isPublicPath) {

       router.push('/');
       setIsAuthorized(true);
    } else {

      setIsAuthorized(true);
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading || (!isAuthorized && !PUBLIC_PATHS.some(path => pathname?.startsWith(path)) && !user)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
           
           <div className="animate-spin text-primary">
              <Loader2 size={40} />
           </div>
           <p className="text-gray-500 font-medium animate-pulse">Đang tải...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
