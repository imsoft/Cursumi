"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type ConsentState = "accepted" | "rejected" | null;

const STORAGE_KEY = "cursumi_cookie_consent";
const COOKIE_KEY = "cursumi_consent";

function readConsentCookie(): ConsentState {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_KEY}=([^;]*)`));
  const val = match ? decodeURIComponent(match[1]) : null;
  if (val === "accepted" || val === "rejected") return val;
  return null;
}

function writeConsentCookie(value: ConsentState) {
  if (typeof document === "undefined" || !value) return;
  const maxAge = 60 * 60 * 24 * 365; // 1 año
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(value)}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

const AUTH_PATHS = ["/login", "/signup", "/forgot-password", "/reset-password"];

export function CookieConsent() {
  const pathname = usePathname();
  // Leer la cookie sincrónicamente en el primer render para evitar flash
  const [consent, setConsent] = useState<ConsentState | "loading">(() => {
    const cookieVal = readConsentCookie();
    if (cookieVal) return cookieVal;
    return "loading";
  });

  useEffect(() => {
    if (consent !== "loading") return;
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState | null;
    if (stored) {
      writeConsentCookie(stored);
    }
    setConsent(stored);
  }, [consent]);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    writeConsentCookie("accepted");
    setConsent("accepted");
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, "rejected");
    writeConsentCookie("rejected");
    setConsent("rejected");
  }

  if (consent !== null) return null;

  const isAuthPage = AUTH_PATHS.some((p) => pathname?.startsWith(p));

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className={
        isAuthPage
          ? "fixed bottom-4 left-4 right-4 z-50 rounded-xl border border-border bg-background/95 backdrop-blur-sm p-4 shadow-lg sm:right-auto sm:max-w-sm"
          : "fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm p-4 shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-xl sm:border"
      }
    >
      <p className="text-sm font-semibold text-foreground mb-1">Usamos cookies</p>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y
        personalizar contenido.{" "}
        <Link href="/privacy" className="underline hover:text-foreground transition-colors">
          Política de privacidad
        </Link>
      </p>
      <div className="flex gap-2">
        <button
          onClick={reject}
          className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          Rechazar
        </button>
        <button
          onClick={accept}
          className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Aceptar todas
        </button>
      </div>
    </div>
  );
}

/** Hook para leer el consentimiento desde cualquier componente */
export function useCookieConsent(): ConsentState {
  const [consent, setConsent] = useState<ConsentState>(() => readConsentCookie());
  useEffect(() => {
    if (consent) return;
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState | null;
    setConsent(stored);
  }, [consent]);
  return consent;
}
