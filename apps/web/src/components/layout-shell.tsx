"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import dynamic from "next/dynamic";

import { PWARegister } from "@/components/pwa-register";

// Navbar y Footer solo aparecen en rutas públicas. Cargándolos con next/dynamic
// (SSR activo) su JS queda en chunks separados y NO se descarga en /dashboard,
// /instructor ni /admin, donde van ocultos.
const Navbar = dynamic(() => import("@/components/navbar").then((m) => m.Navbar));
const Footer = dynamic(() => import("@/components/footer").then((m) => m.Footer));

interface LayoutShellProps {
  children: ReactNode;
}

export const LayoutShell = ({ children }: LayoutShellProps) => {
  const pathname = usePathname();
  const hideGlobalShell =
    (pathname?.startsWith("/instructor/") || pathname === "/instructor") ||
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/business/dashboard");

  return (
    <>
      <PWARegister />
      {!hideGlobalShell && <Navbar />}
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      {!hideGlobalShell && <Footer />}
    </>
  );
};

