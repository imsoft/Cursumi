"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, ExternalLink, Loader2, Landmark, ShieldCheck, ArrowRight } from "lucide-react";

interface ConnectStatus {
  connected: boolean;
  onboarded: boolean;
}

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

  const justReturned = searchParams.get("connect");

  if (status.onboarded) {
    return (
      <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent backdrop-blur-sm dark:border-emerald-500/30">
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Landmark className="h-5 w-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground text-base">Cuenta bancaria de cobro activada</span>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 gap-1 text-xs">
                  <ShieldCheck className="h-3 w-3" /> Stripe Express
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Recibes automáticamente el <strong className="text-foreground font-semibold">85% neto</strong> de cada venta directamente en tu banco. Cursumi retiene el 15% por servicio y procesamiento.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            disabled={loading}
            className="shrink-0 bg-background/80 hover:bg-background shadow-xs gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
            <span>Panel de Stripe Express</span>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent backdrop-blur-sm dark:border-amber-500/40">
      <CardContent className="flex flex-col gap-3.5 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0">
            <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground text-base">
                  {justReturned === "refresh"
                    ? "Verificación de Stripe incompleta"
                    : "Conecta tu cuenta bancaria para recibir tus ganancias"}
                </span>
                <Badge variant="outline" className="border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 text-xs">
                  Requerido para cobrar
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Configura tu CLABE interbancaria o tarjeta de débito a través de la plataforma segura de Stripe Express. Solo toma 2 minutos.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleConnect}
            disabled={loading}
            className="shrink-0 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-xs gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            <span>Conectar con Stripe</span>
          </Button>
        </div>
        {error && (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 p-2.5 rounded-lg border border-destructive/20">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
