"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { calculateStripeStandard } from "@/lib/stripe-calculator";
import { formatPriceMXN } from "@/lib/utils";
import { TrendingDown, DollarSign, Receipt, AlertCircle } from "lucide-react";

export function StripeSimulator() {
  const [amount, setAmount] = useState(1000);
  const [includeIVA, setIncludeIVA] = useState(true);

  const result = calculateStripeStandard(amount, includeIVA);

  return (
    <Card className="border border-border bg-card/90">
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <CardTitle>Stripe - Pagos Directos</CardTitle>
        </div>
        <CardDescription>
          Calcula las comisiones y el neto que recibirías con Stripe estándar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input de precio */}
        <div className="space-y-2">
          <Label htmlFor="stripe-amount">Precio del curso (MXN)</Label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-semibold text-muted-foreground">$</span>
            <input
              id="stripe-amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="text-3xl font-bold bg-transparent border-b-2 border-border focus:border-primary outline-none w-full"
              min="0"
              step="10"
            />
          </div>
        </div>

        {/* Switch IVA */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="stripe-iva" className="cursor-pointer">
              Precio incluye IVA (16%)
            </Label>
          </div>
          <Switch
            id="stripe-iva"
            checked={includeIVA}
            onCheckedChange={setIncludeIVA}
          />
        </div>

        {/* Resumen visual */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <span className="font-semibold text-blue-900 dark:text-blue-100">
              Precio al cliente
            </span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatPriceMXN(result.totalCobradoCliente, true)}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <span className="font-semibold text-green-900 dark:text-green-100">
              Total a recibir
            </span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatPriceMXN(result.totalRecibido, true)}
            </span>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            <TrendingDown className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">
              Pérdida total:{" "}
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
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-900 dark:text-blue-100">
            <p className="font-semibold mb-1">Stripe Estándar - Características:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Comisión: 3.6% + $3 MXN + IVA por transacción</li>
              <li>Pagos directos a tu cuenta</li>
              <li>No hay comisión de plataforma</li>
              <li>Ideal para vender productos propios</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
