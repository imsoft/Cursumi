"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { PWARegister } from "@/components/pwa-register";

interface LayoutShellProps {
  children: ReactNode;
}

export const LayoutShell = ({ children }: LayoutShellProps) => {
  const pathname = usePathname();
  const hideGlobalShell =
    pathname?.startsWith("/instructor") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin");

  return (
    <>
      <PWARegister />
      {!hideGlobalShell && <Navbar />}
      {children}
      {!hideGlobalShell && <Footer />}
    </>
  );
};

