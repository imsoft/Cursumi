import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const plans = [
  {
    name: "Starter",
    seats: "Hasta 10 empleados",
    highlighted: false,
    features: [
      "Catálogo completo de cursos",
      "Dashboard de métricas",
      "Certificados automáticos",
      "1 equipo",
      "Soporte por email",
    ],
  },
  {
    name: "Business",
    seats: "Hasta 50 empleados",
    highlighted: true,
    features: [
      "Todo lo de Starter",
      "Cursos exclusivos para empresas",
      "Equipos ilimitados",
      "Materiales internos (PDFs)",
      "Soporte prioritario",
    ],
  },
  {
    name: "Enterprise",
    seats: "Empleados ilimitados",
    highlighted: false,
    features: [
      "Todo lo de Business",
      "Cursos a medida",
      "Manager de cuenta dedicado",
      "Onboarding personalizado",
      "SLA garantizado",
    ],
  },
];

export function BusinessPricing() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Planes
        </p>
        <h2 className="mt-3 text-3xl font-black text-foreground sm:text-4xl">
          Escoge el plan ideal para tu empresa
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Precio basado en asientos y cursos. Contáctanos para una cotización
          personalizada.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={`flex flex-col ${
              plan.highlighted
                ? "border-primary shadow-xl shadow-primary/10 ring-1 ring-primary"
                : "border-border"
            }`}
          >
            <CardHeader>
              {plan.highlighted && (
                <span className="mb-2 inline-block w-fit rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white">
                  Más popular
                </span>
              )}
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{plan.seats}</p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-6">
              <ul className="flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/contact" className="w-full">
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                >
                  Solicitar cotización
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
