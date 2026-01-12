"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/sign-in") || 
                     pathname?.startsWith("/sign-up") ||
                     pathname?.startsWith("/forgot-password") ||
                     pathname?.startsWith("/verify-otp") ||
                     pathname?.startsWith("/reset-password") ||
                     pathname?.startsWith("/select-pet");

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
