"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
const COOLDOWN_SECONDS = 60;

export function VerifyEmailSentClient({ email, returnUrl }: { email: string | null; returnUrl?: string | null }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (!email?.trim()) {
      setStatus("error");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        setStatus("error");
        return;
      }
      setStatus("sent");
      setCooldown(COOLDOWN_SECONDS);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verifica tu correo electrónico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground text-center">
          Te enviamos un correo con un enlace para verificar tu cuenta. Revisa tu
          bandeja de entrada y haz clic en el enlace.
        </p>
        {returnUrl && (
          <p className="text-xs text-muted-foreground text-center">
            Cuando hayas verificado tu correo, podrás iniciar sesión y volver al curso.
          </p>
        )}
        <div className="rounded-lg border border-border bg-muted/50 p-4">
          <p className="text-xs text-muted-foreground">
            <strong>¿No recibiste el correo?</strong>
            <br />
            Revisa la carpeta de spam. Puede tardar unos minutos en llegar.
          </p>
          {email && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleResend}
                disabled={status === "sending" || cooldown > 0}
              >
                {status === "sending"
                  ? "Enviando..."
                  : cooldown > 0
                    ? `Reenviar en ${cooldown}s`
                    : "Reenviar correo de verificación"}
              </Button>
              {status === "sent" && (
                <p className="mt-2 text-xs text-green-600 text-center">
                  Correo reenviado correctamente.
                </p>
              )}
              {status === "error" && (
                <p className="mt-2 text-xs text-destructive text-center">
                  No se pudo reenviar. Intenta de nuevo en un momento.
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild variant="default" className="w-full">
            <Link href={returnUrl ? `/login?returnUrl=${encodeURIComponent(returnUrl)}` : "/login"}>
              Ir a iniciar sesión
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
