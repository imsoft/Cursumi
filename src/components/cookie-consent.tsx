"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ConsentState = "accepted" | "rejected" | null;

const STORAGE_KEY = "cursumi_cookie_consent";

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState | "loading">("loading");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState | null;
    setConsent(stored);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setConsent("accepted");
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, "rejected");
    setConsent("rejected");
  }

  // No mostrar mientras carga o ya hay decisión
  if (consent !== null) return null;

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-sm p-4 shadow-lg sm:bottom-4 sm:left-4 sm:right-auto sm:max-w-sm sm:rounded-xl sm:border"
    >
      <p className="text-sm font-semibold text-foreground mb-1">Usamos cookies 🍪</p>
      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el tráfico y
        personalizar contenido. Puedes aceptarlas o rechazar las no esenciales.{" "}
        <Link href="/privacidad" className="underline hover:text-foreground transition-colors">
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
  const [consent, setConsent] = useState<ConsentState>(null);
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ConsentState | null;
    setConsent(stored);
  }, []);
  return consent;
}
