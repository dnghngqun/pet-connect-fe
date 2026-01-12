import type React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from "react-hot-toast";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster />
      <HotToaster position="top-right" />
    </>
  );
}
