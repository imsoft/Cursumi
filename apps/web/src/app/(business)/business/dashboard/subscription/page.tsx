"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, BookOpenCheck, Calendar, Check } from "lucide-react";

type CheckoutPlan = "starter" | "business";

function PlanSelector() {
  const [loading, setLoading] = useState<CheckoutPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(plan: CheckoutPlan) {
    setError(null);
    setLoading(plan);
    try {
      const res = await fetch("/api/business/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "No se pudo iniciar el pago. Inténtalo de nuevo.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(null);
    }
  }

  const plans: {
    id: CheckoutPlan;
    name: string;
    seats: string;
    features: string[];
    highlighted?: boolean;
  }[] = [
    {
      id: "starter",
      name: "Starter",
      seats: "Hasta 10 empleados",
      features: ["Catálogo completo", "Métricas", "Certificados", "1 equipo"],
    },
    {
      id: "business",
      name: "Business",
      seats: "Hasta 50 empleados",
      highlighted: true,
      features: [
        "Todo lo de Starter",
        "Cursos exclusivos",
        "Equipos ilimitados",
        "Materiales internos",
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="py-6 text-center">
          <p className="text-muted-foreground">
            Aún no tienes un plan activo. Elige uno para empezar a capacitar a tu equipo.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id} className={plan.highlighted ? "border-primary" : undefined}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                {plan.highlighted && <Badge>Popular</Badge>}
              </div>
              <p className="text-sm text-muted-foreground">{plan.seats}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ul className="flex flex-col gap-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => subscribe(plan.id)}
                disabled={loading !== null}
                variant={plan.highlighted ? "default" : "outline"}
              >
                {loading === plan.id ? "Redirigiendo..." : "Suscribirme"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          ¿Necesitas más de 50 empleados o un plan a medida?{" "}
          <a href="mailto:contacto@cursumi.com" className="text-primary underline">
            Contáctanos para Enterprise
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

interface OrgData {
  name: string;
  subscription: {
    status: string;
    maxSeats: number;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  _count: { members: number; courseAccess: number };
}

const statusLabels: Record<string, string> = {
  active: "Activa",
  past_due: "Pago pendiente",
  canceled: "Cancelada",
  trialing: "Prueba",
};

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

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Suscripción" description="Detalles de tu plan de Cursumi Business" />

      {!sub ? (
        <PlanSelector />
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg">Plan actual</CardTitle>
                <Badge variant={sub.status === "active" ? "default" : "outline"}>
                  {statusLabels[sub.status] || sub.status}
                </Badge>
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
