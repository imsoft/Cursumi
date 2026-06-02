"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Gift, DollarSign, Copy, Check, ExternalLink } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReferralEntry {
  id: string;
  status: "pending" | "earned" | "paid";
  commissionAmount: number | null;
  createdAt: string;
  referredName: string;
  referredAt: string;
}

interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  pendingReferrals: number;
  earnedReferrals: number;
  totalEarnedCents: number;
  pendingPayoutCents: number;
  referrals: ReferralEntry[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMXN(cents: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cents / 100);
}

const STATUS_MAP: Record<ReferralEntry["status"], { label: string; variant: "default" | "outline" }> = {
  pending: { label: "Pendiente", variant: "outline" },
  earned: { label: "Comisión ganada", variant: "default" },
  paid: { label: "Pagado", variant: "outline" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ReferralDashboard() {
  const [data, setData] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const linkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/me/referral")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyLink = async () => {
    if (!data?.referralLink) return;
    try {
      await navigator.clipboard.writeText(data.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      linkRef.current?.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="animate-pulse space-y-2">
                  <div className="h-3 w-24 rounded bg-muted" />
                  <div className="h-8 w-16 rounded bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No se pudo cargar el programa de referidos.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Programa de referidos</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comparte tu link y gana el <strong>10 %</strong> de comisión por cada primera compra
          de los usuarios que registres.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Referidos totales</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{data.totalReferrals}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {data.pendingReferrals} sin compra · {data.earnedReferrals} compraron
                </p>
              </div>
              <div className="rounded-lg bg-primary/10 p-2">
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Comisiones acumuladas</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {formatMXN(data.totalEarnedCents)}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-2">
                <DollarSign className="h-5 w-5 text-emerald-600" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendiente de pago</p>
                <p className="mt-1 text-3xl font-bold text-foreground">
                  {formatMXN(data.pendingPayoutCents)}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Se paga mensualmente
                </p>
              </div>
              <div className="rounded-lg bg-amber-500/10 p-2">
                <Gift className="h-5 w-5 text-amber-600" aria-hidden="true" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link para compartir */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tu link de referido</CardTitle>
          <p className="text-sm text-muted-foreground font-normal mt-1">
            Compártelo en redes, grupos de WhatsApp, o directamente con amigos.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                ref={linkRef}
                readOnly
                value={data.referralLink}
                aria-label="Tu link de referido"
                className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground pr-10 font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                onFocus={(e) => e.target.select()}
              />
              <a
                href={data.referralLink}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Abrir link en nueva pestaña"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>
            <button
              onClick={copyLink}
              aria-label={copied ? "Link copiado" : "Copiar link"}
              aria-live="polite"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Copiar
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Código: <span className="font-mono font-semibold text-foreground">{data.referralCode}</span>
          </p>
        </CardContent>
      </Card>

      {/* Historial de referidos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial</CardTitle>
        </CardHeader>
        <CardContent>
          {data.referrals.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Aún no has referido a nadie. Comparte tu link y empieza a ganar.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {data.referrals.map((r) => {
                const status = STATUS_MAP[r.status];
                return (
                  <li key={r.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{r.referredName}</p>
                      <p className="text-xs text-muted-foreground">
                        Se registró el{" "}
                        <time dateTime={r.referredAt}>
                          {new Date(r.referredAt).toLocaleDateString("es-MX")}
                        </time>
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {r.commissionAmount != null && r.commissionAmount > 0 && (
                        <span className="text-sm font-semibold text-emerald-600">
                          {formatMXN(r.commissionAmount)}
                        </span>
                      )}
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Cómo funciona */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">¿Cómo funciona?</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3" aria-label="Pasos del programa de referidos">
            {[
              { step: "1", text: "Copia tu link de referido y compártelo con amigos, familia o en redes sociales." },
              { step: "2", text: "Cuando alguien se registra con tu link, aparece en tu lista de referidos." },
              { step: "3", text: "Al hacer su primera compra, ganas el 10 % del monto neto como comisión." },
              { step: "4", text: "Las comisiones se acumulan y se pagan mensualmente a tu cuenta." },
            ].map(({ step, text }) => (
              <li key={step} className="flex gap-3">
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary"
                  aria-hidden="true"
                >
                  {step}
                </span>
                <p className="text-sm text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
