"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { calculateStripeStandard, calculateStripeConnect } from "@/lib/stripe-calculator";
import { formatPriceMXN } from "@/lib/utils";
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";

export function PricingComparison() {
  const [amount, setAmount] = useState(1000);
  const [platformFee, setPlatformFee] = useState(20);
  const [includeIVA, setIncludeIVA] = useState(true);

  const stripeResult = calculateStripeStandard(amount, includeIVA);
  const connectResult = calculateStripeConnect(amount, platformFee, includeIVA);

  const difference = stripeResult.totalRecibido - connectResult.totalRecibido;
  const percentageDiff = (difference / stripeResult.totalRecibido) * 100;

  return (
    <Card className="border border-border bg-card/90">
      <CardHeader>
        <CardTitle>Comparación Stripe vs Stripe Connect</CardTitle>
        <CardDescription>
          Compara lado a lado las dos opciones de procesamiento de pagos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs compartidos */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="compare-amount">Precio del curso (MXN)</Label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-muted-foreground">$</span>
              <input
                id="compare-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="text-2xl font-bold bg-transparent border-b-2 border-border focus:border-primary outline-none w-full"
                min="0"
                step="10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="compare-platform-fee">Comisión plataforma (%)</Label>
            <div className="flex items-center gap-2">
              <input
                id="compare-platform-fee"
                type="range"
                value={platformFee}
                onChange={(e) => setPlatformFee(Number(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                min="0"
                max="50"
                step="1"
              />
              <span className="text-2xl font-bold min-w-[60px] text-right">{platformFee}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
          <Label htmlFor="compare-iva" className="cursor-pointer">
            Precio incluye IVA (16%)
          </Label>
          <Switch
            id="compare-iva"
            checked={includeIVA}
            onCheckedChange={setIncludeIVA}
          />
        </div>

        {/* Comparación visual */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Stripe Estándar */}
          <div className="space-y-3 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-center">
              Stripe Estándar
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio</span>
                <span className="font-mono">{formatPriceMXN(amount, true)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                <span>Comisión Stripe</span>
                <span className="font-mono">
                  -{formatPriceMXN(stripeResult.comisionStripe + stripeResult.ivaComisionStripe, true)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                <span>Retenciones</span>
                <span className="font-mono">
                  -{formatPriceMXN(stripeResult.isrRetencion + stripeResult.ivaRetencion, true)}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-green-900 dark:text-green-100">Neto</span>
                <span className="font-mono text-green-600 dark:text-green-400">
                  {formatPriceMXN(stripeResult.totalRecibido, true)}
                </span>
              </div>
              <div className="text-xs text-center text-muted-foreground">
                {((stripeResult.totalRecibido / amount) * 100).toFixed(1)}% del precio original
              </div>
            </div>
          </div>

          {/* Stripe Connect */}
          <div className="space-y-3 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20">
            <h3 className="font-semibold text-purple-900 dark:text-purple-100 text-center">
              Stripe Connect
            </h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Precio</span>
                <span className="font-mono">{formatPriceMXN(amount, true)}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                <span>Comisión Stripe</span>
                <span className="font-mono">
                  -{formatPriceMXN(connectResult.comisionStripe + connectResult.ivaComisionStripe, true)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-orange-600 dark:text-orange-400">
                <span>Comisión plataforma</span>
                <span className="font-mono">
                  -{formatPriceMXN(connectResult.comisionPlataforma, true)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-red-600 dark:text-red-400">
                <span>Retenciones</span>
                <span className="font-mono">
                  -{formatPriceMXN(connectResult.isrRetencion + connectResult.ivaRetencion, true)}
                </span>
              </div>
              <div className="h-px bg-border my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span className="text-green-900 dark:text-green-100">Neto</span>
                <span className="font-mono text-green-600 dark:text-green-400">
                  {formatPriceMXN(connectResult.totalRecibido, true)}
                </span>
              </div>
              <div className="text-xs text-center text-muted-foreground">
                {((connectResult.totalRecibido / amount) * 100).toFixed(1)}% del precio original
              </div>
            </div>
          </div>
        </div>

        {/* Diferencia */}
        <div className={`p-4 rounded-lg border-2 ${
          difference > 0
            ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20"
            : "border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20"
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {difference > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
              <span className={`font-semibold ${
                difference > 0
                  ? "text-green-900 dark:text-green-100"
                  : "text-red-900 dark:text-red-100"
              }`}>
                Stripe Estándar {difference > 0 ? "gana" : "pierde"}
              </span>
            </div>
            <div className="text-right">
              <div className={`text-xl font-bold ${
                difference > 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {formatPriceMXN(Math.abs(difference), true)}
              </div>
              <div className="text-sm text-muted-foreground">
                ({Math.abs(percentageDiff).toFixed(2)}%)
              </div>
            </div>
          </div>
        </div>

        {/* Análisis */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border">
          <h4 className="font-semibold text-sm uppercase text-muted-foreground">
            Análisis
          </h4>
          <div className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Stripe Estándar</span> es mejor cuando:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Vendes solo tus propios productos/cursos</li>
              <li>No necesitas dividir pagos con otros</li>
              <li>Quieres maximizar ingresos (sin comisión de plataforma)</li>
            </ul>

            <p className="mt-3">
              <span className="font-semibold">Stripe Connect</span> es mejor cuando:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Operas un marketplace con múltiples instructores</li>
              <li>Necesitas dividir pagos automáticamente</li>
              <li>Quieres cobrar una comisión por la plataforma</li>
              <li>Los instructores necesitan recibir pagos directamente</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
