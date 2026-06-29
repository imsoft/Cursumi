"use client";

import { useState } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldOff } from "lucide-react";

type Step = "idle" | "password" | "verify" | "disable";

export function TwoFactorSettings() {
  const { data: session, refetch } = authClient.useSession();
  // `twoFactorEnabled` lo añade el plugin al usuario de la sesión.
  const sessionEnabled = Boolean(
    (session?.user as { twoFactorEnabled?: boolean } | undefined)?.twoFactorEnabled,
  );
  // Override local para reflejar el cambio inmediatamente tras activar/desactivar.
  const [override, setOverride] = useState<boolean | null>(null);
  const enabled = override ?? sessionEnabled;

  const [step, setStep] = useState<Step>("idle");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [totpUri, setTotpUri] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const reset = () => {
    setStep("idle");
    setPassword("");
    setCode("");
    setQrDataUrl(null);
    setTotpUri(null);
    setBackupCodes([]);
    setError(null);
  };

  // Paso 1: validar contraseña y obtener el secreto TOTP + códigos de respaldo.
  const startEnable = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authClient.twoFactor.enable({ password });
      if (res.error) {
        setError(
          res.error.message?.toLowerCase().includes("password")
            ? "La contraseña es incorrecta."
            : res.error.message || "No se pudo iniciar la activación.",
        );
        return;
      }
      const { totpURI, backupCodes: codes } = res.data as {
        totpURI: string;
        backupCodes: string[];
      };
      setTotpUri(totpURI);
      setBackupCodes(codes);
      setQrDataUrl(await QRCode.toDataURL(totpURI, { margin: 1, width: 220 }));
      setStep("verify");
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: confirmar con un código del autenticador para completar la activación.
  const confirmEnable = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authClient.twoFactor.verifyTotp({ code });
      if (res.error) {
        setError("Código inválido. Verifica el código de tu app y vuelve a intentar.");
        return;
      }
      setOverride(true);
      setSuccess("Autenticación en dos pasos activada.");
      setStep("idle");
      setPassword("");
      setCode("");
      refetch?.();
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const disable = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await authClient.twoFactor.disable({ password });
      if (res.error) {
        setError(
          res.error.message?.toLowerCase().includes("password")
            ? "La contraseña es incorrecta."
            : res.error.message || "No se pudo desactivar.",
        );
        return;
      }
      setOverride(false);
      setSuccess("Autenticación en dos pasos desactivada.");
      reset();
      refetch?.();
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {enabled ? <ShieldCheck className="h-5 w-5 text-green-600" /> : <ShieldOff className="h-5 w-5" />}
          Autenticación en dos pasos (2FA)
        </CardTitle>
        <p className="text-sm text-muted-foreground font-normal">
          Añade una capa extra de seguridad con una app de autenticación (Google
          Authenticator, Authy, 1Password…). Muy recomendado para cuentas de
          instructor y administrador.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {success && <p className="text-sm text-green-600">{success}</p>}

        {/* Estado actual */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-4 py-3">
          <span className="text-sm font-medium text-foreground">
            Estado: {enabled ? "Activado" : "Desactivado"}
          </span>
          {step === "idle" && (
            enabled ? (
              <Button variant="outline" size="sm" onClick={() => { setSuccess(null); setStep("disable"); }}>
                Desactivar
              </Button>
            ) : (
              <Button size="sm" onClick={() => { setSuccess(null); setStep("password"); }}>
                Activar 2FA
              </Button>
            )
          )}
        </div>

        {/* Paso 1: pedir contraseña para activar */}
        {step === "password" && (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Confirma tu contraseña para generar el código QR.
            </p>
            <PasswordInput
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={startEnable} disabled={loading || password.length === 0}>
                {loading ? "Generando…" : "Continuar"}
              </Button>
              <Button variant="ghost" onClick={reset} disabled={loading}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Paso 2: mostrar QR + backup codes + verificar */}
        {step === "verify" && (
          <div className="space-y-4 rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium text-foreground">1. Escanea el código QR</p>
              <p className="text-xs text-muted-foreground">
                Ábrelo en tu app de autenticación. ¿No puedes escanear? Usa esta clave:
              </p>
              {qrDataUrl && (
                <Image
                  src={qrDataUrl}
                  alt="Código QR para 2FA"
                  width={220}
                  height={220}
                  className="mt-2 rounded-lg border border-border bg-white p-2"
                  unoptimized
                />
              )}
              {totpUri && (
                <code className="mt-2 block break-all rounded bg-muted/40 p-2 text-xs text-muted-foreground">
                  {new URLSearchParams(totpUri.split("?")[1]).get("secret")}
                </code>
              )}
            </div>

            {backupCodes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-foreground">2. Guarda tus códigos de respaldo</p>
                <p className="text-xs text-muted-foreground">
                  Te permiten entrar si pierdes el teléfono. Guárdalos en un lugar
                  seguro: no volverás a verlos.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1 rounded bg-muted/40 p-3 font-mono text-xs text-foreground sm:grid-cols-3">
                  {backupCodes.map((c) => (
                    <span key={c}>{c}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium text-foreground">3. Confirma con un código</p>
              <Input
                label="Código de 6 dígitos"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button onClick={confirmEnable} disabled={loading || code.length !== 6}>
                {loading ? "Verificando…" : "Activar"}
              </Button>
              <Button variant="ghost" onClick={reset} disabled={loading}>
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Desactivar: pedir contraseña */}
        {step === "disable" && (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Confirma tu contraseña para desactivar la verificación en dos pasos.
            </p>
            <PasswordInput
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button variant="destructive" onClick={disable} disabled={loading || password.length === 0}>
                {loading ? "Desactivando…" : "Desactivar 2FA"}
              </Button>
              <Button variant="ghost" onClick={reset} disabled={loading}>
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
