
"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// List of public paths that don't require authentication
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
    // If loading, do nothing yet
    if (isLoading) return;

    // Check if current path is public
    const isPublicPath = PUBLIC_PATHS.some(path => pathname?.startsWith(path));

    if (!user && !isPublicPath) {
      // If not logged in and trying to access private route, redirect to sign-in
      // Encode the return URL so we can redirect back after login (optional)
      const returnUrl = encodeURIComponent(pathname || '/');
      router.push(`/sign-in?returnUrl=${returnUrl}`);
      setIsAuthorized(false);
    } else if (user && isPublicPath) {
       // If logged in and trying to access public auth pages (like sign-in), redirect to home
       router.push('/');
       setIsAuthorized(true); // Technically authorized but redirecting
    } else {
      // Authorized (Logged in accessing private, or not logged in accessing public)
      setIsAuthorized(true);
    }
  }, [user, isLoading, pathname, router]);


  // Show loader while checking auth state or if not authorized yet (to prevent flash)
  if (isLoading || (!isAuthorized && !PUBLIC_PATHS.some(path => pathname?.startsWith(path)) && !user)) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
           {/* Replace with your branding/logo if you have one */}
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
