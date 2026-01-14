

import { CartProvider } from "@/components/cart-provider";
import Footer from "@/components/footer";
import Header from "@/components/header";
import PageBackground from "@/components/page-background";
import { Toaster } from "@/components/ui/toaster";
import { ChatProvider } from "@/context/ChatContext";
import MiniChat from "@/components/chat/mini-chat";
import GlobalSseListener from "@/components/chat/global-sse-listener";
import AuthManager from "@/components/auth-manager";
import { Toaster as HotToaster } from "react-hot-toast";
import PetMascot from "@/components/pet-mascot";
import AuthGuard from "@/components/auth-guard";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "PetPals - What your pet needs, when they need it",
  description: "Premium pet products for cats and dogs with same-day delivery",
  generator: "v0.dev",
};

import { PostModalProvider } from "@/components/post-modal-provider";
import ConditionalLayout from "@/components/conditional-layout";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className={`${plusJakartaSans.variable} font-sans`} suppressHydrationWarning={true}>
        <PageBackground />
        <CartProvider>
          <ChatProvider>
            
              <AuthGuard>
                <PostModalProvider>
                  <div className="flex min-h-screen flex-col">
                    <AuthManager />
                    <ConditionalLayout>{children}</ConditionalLayout>
                  </div>
                  <PetMascot />
                  <MiniChat />
                  <GlobalSseListener />
                  <Toaster />
                  <HotToaster position="top-right" />
                </PostModalProvider>
              </AuthGuard>
          
          </ChatProvider>
        </CartProvider>
      </body>
    </html>
  );
}
