"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpenCheck, Calendar } from "lucide-react";

interface OrgData {
  name: string;
  subscription: {
    status: string;
    maxSeats: number;
    amountCents: number | null;
    billingInterval: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  _count: { members: number; courseAccess: number };
}

const statusLabels: Record<string, string> = {
  pending: "Pendiente de pago",
  active: "Activa",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  trialing: "Prueba",
};

function formatMoney(cents: number | null, interval: string | null) {
  if (cents == null) return "—";
  const v = (cents / 100).toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
  return interval === "year" ? `${v} / año` : `${v} / mes`;
}

/** Cotización provisionada por el equipo de Cursumi, pendiente de pago. */
function PendingQuote({
  amountCents,
  billingInterval,
  maxSeats,
  courseAccess,
}: {
  amountCents: number | null;
  billingInterval: string | null;
  maxSeats: number;
  courseAccess: number;
}) {
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setPaying(true);
    try {
      const res = await fetch("/api/business/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo iniciar el pago. Inténtalo de nuevo.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setPaying(false);
    }
  }

  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center gap-3">
          <CardTitle className="text-lg">Tu cotización</CardTitle>
          <Badge variant="outline">Pendiente de pago</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div>
          <p className="text-3xl font-black text-foreground">
            {formatMoney(amountCents, billingInterval)}
          </p>
          <p className="text-sm text-muted-foreground">
            {maxSeats} asientos · {courseAccess} cursos incluidos
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Tu plan fue preparado por nuestro equipo. Actívalo para dar acceso a tu
          equipo.
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={pay} disabled={paying} className="self-start">
          {paying ? "Redirigiendo..." : "Pagar y activar"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SubscriptionPage() {
  const [org, setOrg] = useState<OrgData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/business/organizations")
      .then((r) => r.json())
      .then((d) => setOrg(d.organization))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const sub = org?.subscription;
  const isPending = sub && sub.status !== "active";

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Suscripción" description="Detalles de tu plan de Cursumi Business" />

      {!sub ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Aún no tienes una cotización.{" "}
              <a href="/business/cotizacion" className="text-primary underline">
                Solicita una
              </a>{" "}
              y nuestro equipo preparará tu plan.
            </p>
          </CardContent>
        </Card>
      ) : isPending ? (
        <PendingQuote
          amountCents={sub.amountCents}
          billingInterval={sub.billingInterval}
          maxSeats={sub.maxSeats}
          courseAccess={org?._count.courseAccess || 0}
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">Plan actual</CardTitle>
                <Badge variant="default">{statusLabels[sub.status] || sub.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Asientos</p>
                    <p className="font-bold">
                      {org?._count.members || 0} / {sub.maxSeats}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Cursos</p>
                    <p className="font-bold">{org?._count.courseAccess || 0}</p>
                  </div>
                </div>
                {sub.currentPeriodEnd && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Próximo cobro</p>
                      <p className="font-bold">
                        {new Date(sub.currentPeriodEnd).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              {sub.cancelAtPeriodEnd && (
                <p className="text-sm text-yellow-600">
                  Tu suscripción se cancelará al final del periodo actual.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Para cambiar tu plan o método de pago,{" "}
              <a href="mailto:contacto@cursumi.com" className="text-primary underline">
                contáctanos por correo
              </a>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
