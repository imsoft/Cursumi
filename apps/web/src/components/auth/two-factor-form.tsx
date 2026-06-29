"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";

export function TwoFactorForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

  const [mode, setMode] = useState<"totp" | "backup">("totp");
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const safeReturn =
    returnUrl && returnUrl.startsWith("/") && !returnUrl.startsWith("//")
      ? returnUrl
      : "/dashboard";

  const verify = async () => {
    setError(null);
    setLoading(true);
    try {
      const res =
        mode === "totp"
          ? await authClient.twoFactor.verifyTotp({ code, trustDevice })
          : await authClient.twoFactor.verifyBackupCode({ code });
      if (res.error) {
        setError(
          mode === "totp"
            ? "Código incorrecto. Revisa tu app de autenticación."
            : "Código de respaldo inválido o ya usado.",
        );
        return;
      }
      router.push(safeReturn);
    } catch {
      setError("Ocurrió un error. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const isBackup = mode === "backup";

  return (
    <Card className="w-full max-w-md border border-border bg-card/80 shadow-xl">
      <CardHeader className="flex flex-col gap-2 px-6 pt-6">
        <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Verificación en dos pasos
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {isBackup
            ? "Ingresa uno de tus códigos de respaldo."
            : "Ingresa el código de 6 dígitos de tu app de autenticación."}
        </p>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify();
          }}
          className="space-y-4"
        >
          <Input
            label={isBackup ? "Código de respaldo" : "Código de 6 dígitos"}
            inputMode={isBackup ? "text" : "numeric"}
            autoFocus
            value={code}
            onChange={(e) =>
              setCode(
                isBackup
                  ? e.target.value.trim()
                  : e.target.value.replace(/\D/g, "").slice(0, 6),
              )
            }
          />

          {!isBackup && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
              />
              Confiar en este dispositivo por 30 días
            </label>
          )}

          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || (isBackup ? code.length === 0 : code.length !== 6)}
          >
            {loading ? "Verificando…" : "Verificar"}
          </Button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(isBackup ? "totp" : "backup");
            setCode("");
            setError(null);
          }}
          className="w-full text-center text-sm text-primary underline"
        >
          {isBackup ? "Usar código de la app" : "¿No tienes tu teléfono? Usa un código de respaldo"}
        </button>
      </CardContent>
    </Card>
  );
}
