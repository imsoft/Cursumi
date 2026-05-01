"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

interface ConnectStatus {
  connected: boolean;
  onboarded: boolean;
}

const ERROR_REASONS: Record<string, string> = {
  access_denied: "Cancelaste la conexión con Stripe. Puedes intentarlo de nuevo cuando quieras.",
  oauth_failed: "No se pudo completar la conexión con Stripe. Intenta de nuevo.",
  no_account: "Stripe no devolvió una cuenta válida. Intenta de nuevo.",
};

export function StripeConnectBanner() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/instructor/stripe/connect")
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus({ connected: false, onboarded: false }));
  }, []);

  // Mostrar error si Stripe redirigió con error
  useEffect(() => {
    if (searchParams.get("connect") === "error") {
      const reason = searchParams.get("reason") ?? "oauth_failed";
      setError(ERROR_REASONS[reason] ?? "No se pudo conectar con Stripe. Intenta de nuevo.");
    }
  }, [searchParams]);

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/instructor/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? "No se pudo iniciar la conexión con Stripe. Intenta de nuevo.");
      }
    } catch {
      setError("Error de conexión. Verifica tu internet e intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!status) return null;

  if (status.onboarded) {
    return (
      <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                Cuenta de Stripe conectada
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                Recibirás el 85% de cada venta directamente en tu cuenta bancaria de Stripe.
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleConnect} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
            <span className="ml-2">Ir a Stripe</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Conecta tu cuenta de Stripe para recibir pagos
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Vincula tu cuenta de Stripe existente o crea una nueva. Recibirás el 85% de cada venta directo a tu banco.
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleConnect} disabled={loading} className="shrink-0">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Conectar con Stripe
          </Button>
        </div>
        {error && (
          <p className="text-xs text-destructive pl-8">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
