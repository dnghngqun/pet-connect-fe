import { CartProvider } from "@/components/cart-provider";
import Footer from "@/components/footer";
import Header from "@/components/header";
import PageBackground from "@/components/page-background";
import { Toaster } from "@/components/ui/toaster";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import "leaflet/dist/leaflet.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PetPals - What your pet needs, when they need it",
  description: "Premium pet products for cats and dogs with same-day delivery",
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <PageBackground />
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster />
        </CartProvider>
      </body>
    </html>
  );
}
