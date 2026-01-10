
import { CartProvider } from "@/components/cart-provider";
import Footer from "@/components/footer";
import Header from "@/components/header";
import PageBackground from "@/components/page-background";
import { Toaster } from "@/components/ui/toaster";
import { MiniChatProvider } from "@/contexts/mini-chat-context";
import { ChatProvider } from "@/hooks/useChat";
import { MiniChatContainer } from "@/components/mini-chat/mini-chat-container";
import AuthManager from "@/components/auth-manager";
import { Toaster as HotToaster } from "react-hot-toast";
import PetMascot from "@/components/pet-mascot";
import AuthGuard from "@/components/auth-guard";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Pet Connect",
  description: "A social network for pet lovers.",
};

import { PostModalProvider } from "@/components/post-modal-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans" suppressHydrationWarning={true}>
        <PageBackground />
        <CartProvider>
          <ChatProvider>
            <MiniChatProvider>
              <AuthGuard>
                <PostModalProvider>
                  <div className="flex min-h-screen flex-col">
                    <AuthManager />
                    <Header />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                  <PetMascot />
                  <MiniChatContainer />
                  <Toaster />
                  <HotToaster position="top-right" />
                </PostModalProvider>
              </AuthGuard>
            </MiniChatProvider>
          </ChatProvider>
        </CartProvider>
      </body>
    </html>
  );
}
