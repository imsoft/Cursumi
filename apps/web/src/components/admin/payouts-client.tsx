"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Landmark, Loader2, CheckCircle2, AlertTriangle, Banknote } from "lucide-react";
import { formatPriceMXN } from "@/lib/utils";
import type { InstructorPayoutGroup } from "@/lib/payouts";

type Data = { groups: InstructorPayoutGroup[]; totalPendingCents: number };

const pesos = (cents: number) => formatPriceMXN(cents / 100);
const fecha = (iso: string) =>
  new Date(iso).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Mexico_City" });

/**
 * Cola de pagos a instructores: ventas cobradas por Cursumi cuya parte del
 * instructor sigue en nuestra cuenta de Stripe. Con Stripe conectado se
 * transfiere con un clic; si se pagó por SPEI, se registra a mano.
 */
export function PayoutsClient() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/payouts", { cache: "no-store" });
      if (!res.ok) throw new Error(res.statusText);
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los pagos.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function act(transactionId: string, body: { action: "transfer" } | { action: "mark-paid"; note: string }) {
    setBusy(transactionId);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payouts/${transactionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "No se pudo completar el pago.");
      setDone((d) => ({ ...d, [transactionId]: body.action === "transfer" ? `Transferido (${json.transferId})` : "Registrado como pagado" }));
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo completar el pago.");
    } finally {
      setBusy(null);
    }
  }

  if (!data && !error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Pagos a instructores" description="Parte del instructor cobrada por Cursumi y aún no transferida" />
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Pagos a instructores" description="Parte del instructor cobrada por Cursumi y aún no transferida" />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total pendiente de transferir</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{pesos(data?.totalPendingCents ?? 0)}</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Las ventas nuevas de instructores con Stripe conectado ya no pasan por aquí: Stripe les deposita su parte al cobrar.
          </p>
        </CardContent>
      </Card>

      {data && data.groups.length === 0 && (
        <Card>
          <CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            No hay pagos pendientes. Todo lo cobrado ya está con su instructor.
          </CardContent>
        </Card>
      )}

      {data?.groups.map((g) => (
        <Card key={g.instructorId}>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg">{g.instructorName}</CardTitle>
              <CardDescription>{g.instructorEmail}</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Pendiente</div>
                <div className="text-xl font-bold">{pesos(g.pendingCents)}</div>
              </div>
              {g.stripeOnboarded ? (
                <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                  <Landmark className="h-3 w-3" /> Stripe conectado
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 border-amber-500/40 text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="h-3 w-3" /> Sin Stripe: pagar por SPEI
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-border/50">
            {g.rows.map((r) => (
              <div key={r.transactionId} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 text-sm">
                  <div className="font-medium truncate">{r.courseTitle}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.studentName} · {fecha(r.createdAt)} · cobrado {pesos(r.amountCents)} → instructor{" "}
                    <strong className="text-foreground">{pesos(r.instructorAmountCents)}</strong>
                  </div>
                  {done[r.transactionId] && <div className="text-xs text-emerald-600">{done[r.transactionId]}</div>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {g.stripeOnboarded && (
                    <Button size="sm" disabled={busy === r.transactionId} onClick={() => act(r.transactionId, { action: "transfer" })} className="gap-1.5">
                      {busy === r.transactionId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />}
                      Transferir por Stripe
                    </Button>
                  )}
                  <Input
                    value={notes[r.transactionId] ?? ""}
                    onChange={(e) => setNotes((n) => ({ ...n, [r.transactionId]: e.target.value }))}
                    className="h-8 w-40 text-xs"
                    aria-label="Referencia del pago manual"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === r.transactionId}
                    onClick={() => act(r.transactionId, { action: "mark-paid", note: notes[r.transactionId] ?? "" })}
                    className="gap-1.5"
                  >
                    <Banknote className="h-4 w-4" />
                    Pagado a mano
                  </Button>
                </div>
              </div>
            ))}
            <p className="pt-3 text-[11px] text-muted-foreground">
              "Pagado a mano" es para SPEI o efectivo: escribe la referencia en el campo (folio, fecha) y queda registrado; no mueve dinero.
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
