"use client";

import { CartProvider } from "@/components/cart-provider";
import Footer from "@/components/footer";
import Header from "@/components/header";
import PageBackground from "@/components/page-background";
import { Toaster } from "@/components/ui/toaster";
import type React from "react";
import { usePathname } from "next/navigation";

export function RootLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isChatPage = pathname.startsWith("/chat");

  return (
    <>
      <PageBackground />
      <CartProvider>
        {isChatPage ? (
          <>{children}</>
        ) : (
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        )}
        <Toaster />
      </CartProvider>
    </>
  );
}
