"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StripeSimulator } from "@/components/dashboard/stripe-simulator";
import { StripeConnectSimulator } from "@/components/dashboard/stripe-connect-simulator";
import { PricingComparison } from "@/components/dashboard/pricing-comparison";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Info, Scale, BookOpen } from "lucide-react";

export default function FinancesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Simulador de Precios"
        description="Calcula comisiones de Stripe, Stripe Connect e impuestos mexicanos para diferentes modelos de negocio"
      />

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-border bg-card/90">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-sm font-medium">Stripe México</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.6% + $3</div>
            <p className="text-xs text-muted-foreground mt-1">
              + IVA 16% sobre comisiones
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/90">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-green-600" />
              <CardTitle className="text-sm font-medium">Impuestos MX</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">IVA 16%</div>
            <p className="text-xs text-muted-foreground mt-1">
              ISR 10% | Retención IVA 6.67%
            </p>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/90">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-600" />
              <CardTitle className="text-sm font-medium">Modelo de negocio</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Marketplace</div>
            <p className="text-xs text-muted-foreground mt-1">
              Múltiples instructores
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Información importante */}
      <Card className="border-l-4 border-l-blue-600 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <div className="flex items-start gap-2">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Información sobre los cálculos
              </CardTitle>
              <CardDescription className="text-blue-800 dark:text-blue-200 mt-2">
                Este simulador calcula automáticamente las comisiones de Stripe y los impuestos mexicanos aplicables.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <p className="font-semibold mb-2">Comisiones de Stripe:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>Tarifa base: 3.6% + $3 MXN por transacción</li>
                <li>IVA del 16% sobre las comisiones</li>
                <li>Sin costos ocultos ni mensualidades</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-2">Impuestos mexicanos:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                <li>IVA: 16% (puede estar incluido en el precio)</li>
                <li>Retención ISR: 10% sobre ingresos</li>
                <li>Retención IVA: 6.67% (2/3 del IVA)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs con simuladores */}
      <Tabs defaultValue="comparison" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="stripe">Stripe Estándar</TabsTrigger>
          <TabsTrigger value="connect">Stripe Connect</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4">
          <PricingComparison />
        </TabsContent>

        <TabsContent value="stripe" className="space-y-4">
          <StripeSimulator />
        </TabsContent>

        <TabsContent value="connect" className="space-y-4">
          <StripeConnectSimulator />
        </TabsContent>
      </Tabs>

      {/* Notas adicionales */}
      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle className="text-base">Notas importantes</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          <div>
            <p className="font-semibold text-foreground mb-1">Para Cursumi (Plataforma):</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>
                <span className="font-medium">Stripe Estándar:</span> Los pagos llegan directamente a la cuenta de Cursumi.
                Ideal si Cursumi crea y vende sus propios cursos.
              </li>
              <li>
                <span className="font-medium">Stripe Connect:</span> Permite que múltiples instructores reciban pagos directamente,
                mientras Cursumi cobra una comisión. Ideal para un modelo marketplace.
              </li>
            </ul>
          </div>

          <div>
            <p className="font-semibold text-foreground mb-1">Recomendación para Cursumi:</p>
            <p className="ml-2">
              Si el modelo de negocio es un <span className="font-medium text-purple-600 dark:text-purple-400">marketplace con múltiples instructores</span>,
              usa <span className="font-medium">Stripe Connect</span>. Esto permite:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
              <li>Pagos automáticos a instructores</li>
              <li>Cobro de comisión de plataforma configurable</li>
              <li>Cada instructor maneja sus propios impuestos</li>
              <li>Mejor experiencia para todos los participantes</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <p className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
              Ejemplo con Stripe Connect (comisión 20%):
            </p>
            <p className="text-purple-800 dark:text-purple-200">
              Un curso de <span className="font-medium">$1,000 MXN</span>:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-1 text-purple-800 dark:text-purple-200">
              <li>Cursumi recibe ~$154 (20% menos costos)</li>
              <li>Instructor recibe ~$623 (después de todo)</li>
              <li>Stripe cobra ~$42</li>
              <li>Gobierno (impuestos) ~$181</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
