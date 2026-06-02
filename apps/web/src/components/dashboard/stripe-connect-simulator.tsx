"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { calculateStripeConnect } from "@/lib/stripe-calculator";
import { formatPriceMXN } from "@/lib/utils";
import { TrendingDown, Network, Receipt, AlertCircle, Percent } from "lucide-react";

export function StripeConnectSimulator() {
  const [amount, setAmount] = useState(1000);
  const [platformFee, setPlatformFee] = useState(20);
  const [includeIVA, setIncludeIVA] = useState(true);

  const result = calculateStripeConnect(amount, platformFee, includeIVA);

  return (
    <Card className="border border-border bg-card/90">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Network className="h-5 w-5 text-purple-600" />
          <CardTitle>Stripe Connect - Marketplace</CardTitle>
        </div>
        <CardDescription>
          Calcula las comisiones de Stripe + plataforma y el neto para instructores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input de precio */}
        <div className="space-y-2">
          <Label htmlFor="connect-amount">Precio del curso (MXN)</Label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-muted-foreground">$</span>
            <input
              id="connect-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="text-3xl font-bold bg-transparent border-b-2 border-border focus:border-primary outline-none w-full"
              min="0"
              step="10"
            />
          </div>
        </div>

        {/* Input de comisión de plataforma */}
        <div className="space-y-2">
          <Label htmlFor="platform-fee">Comisión de plataforma (%)</Label>
          <div className="flex items-center gap-4">
            <input
              id="platform-fee"
              type="range"
              value={platformFee}
              onChange={(e) => setPlatformFee(Number(e.target.value))}
              className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
              min="0"
              max="50"
              step="1"
            />
            <div className="flex items-center gap-1 min-w-[80px]">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">{platformFee}</span>
            </div>
          </div>
        </div>

        {/* Switch IVA */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="connect-iva" className="cursor-pointer">
              Precio incluye IVA (16%)
            </Label>
          </div>
          <Switch
            id="connect-iva"
            checked={includeIVA}
            onCheckedChange={setIncludeIVA}
          />
        </div>

        {/* Resumen visual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
            <span className="font-semibold text-purple-900 dark:text-purple-100">
              Precio al cliente
            </span>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatPriceMXN(result.totalCobradoCliente, true)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
              <span className="text-sm font-semibold text-orange-900 dark:text-orange-100 block mb-1">
                Plataforma recibe
              </span>
              <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                {formatPriceMXN(result.comisionPlataforma, true)}
              </span>
            </div>

            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
              <span className="text-sm font-semibold text-green-900 dark:text-green-100 block mb-1">
                Instructor recibe
              </span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
                {formatPriceMXN(result.totalRecibido, true)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">
              Pérdida del instructor:{" "}
              <span className="font-semibold text-red-500">
                {formatPriceMXN(result.precioOriginal - result.totalRecibido, true)}
              </span>
              {" "}({((result.precioOriginal - result.totalRecibido) / result.precioOriginal * 100).toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Desglose detallado */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase">
            Desglose de comisiones e impuestos
          </h4>
          <div className="space-y-2">
            {result.breakdown.map((item, index) => (
              <div
                key={index}
                className={`flex items-center justify-between py-2 px-3 rounded ${
                  item.label.includes("Total")
                    ? "bg-primary/10 font-semibold"
                    : item.label.includes("plataforma")
                    ? "bg-orange-50 dark:bg-orange-950/20"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm ${item.isNegative ? "text-red-600 dark:text-red-400" : ""}`}>
                    {item.label}
                  </span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
                <span className={`font-mono ${item.isNegative ? "text-red-600 dark:text-red-400" : ""}`}>
                  {item.isNegative && "- "}
                  {formatPriceMXN(item.amount, true)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info adicional */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
          <AlertCircle className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-purple-900 dark:text-purple-100">
            <p className="font-semibold mb-1">Stripe Connect - Características:</p>
            <ul className="list-disc list-inside space-y-1 text-purple-800 dark:text-purple-200">
              <li>Comisión Stripe: 3.6% + $3 MXN + IVA</li>
              <li>Comisión de plataforma configurable (Cursumi)</li>
              <li>Pagos divididos automáticamente</li>
              <li>Ideal para marketplaces con múltiples vendedores</li>
              <li>Los instructores reciben pagos directos a su cuenta</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
