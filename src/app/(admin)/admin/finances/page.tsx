"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, Users, Percent } from "lucide-react";
import { formatPriceMXN } from "@/lib/utils";
import Link from "next/link";
import type { AdminFinances } from "@/lib/admin-service";

const ICONS = [DollarSign, Calendar, Percent, CreditCard] as const;

function Calculator(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}

export default function FinancesPage() {
  const [data, setData] = useState<AdminFinances | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/finances", { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(res.statusText);
        return res.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Finanzas" description="Ingresos y transacciones de la plataforma" />
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Finanzas" description="Ingresos y transacciones de la plataforma" />
        <p className="text-destructive">{error ?? "No se pudieron cargar las finanzas."}</p>
      </div>
    );
  }

  const statsWithIcons: StatItem[] = data.financialStats.map((s, i) => ({
    ...s,
    icon: ICONS[i],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Finanzas"
          description="Ingresos y transacciones de la plataforma"
        />
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/simulator">
              <Calculator className="mr-2 h-4 w-4" />
              Simulador de Precios
            </Link>
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar Reporte
          </Button>
        </div>
      </div>

      <StatsGrid stats={statsWithIcons} columns={4} />

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="monthly">Ingresos Mensuales</TabsTrigger>
          <TabsTrigger value="instructors">Por Instructor</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="border border-border bg-card/90">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transacciones Recientes</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              {data.recentTransactions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay transacciones aún.</p>
              ) : (
                <div className="space-y-4">
                  {data.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-foreground">{transaction.course}</p>
                          <Badge variant={transaction.status === "completed" ? "default" : "outline"}>
                            {transaction.status === "completed" ? "Completado" : "Pendiente"}
                          </Badge>
                        </div>
                        <div className="grid gap-1 text-sm text-muted-foreground">
                          <p>Instructor: {transaction.instructor}</p>
                          <p>Estudiante: {transaction.student}</p>
                          <p className="text-xs">
                            {new Date(transaction.date).toLocaleDateString("es-MX", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-lg font-bold text-foreground">
                          {formatPriceMXN(transaction.amount / 100)}
                        </p>
                        <div className="text-xs space-y-0.5">
                          <p className="text-green-600 dark:text-green-400 font-semibold">
                            +{formatPriceMXN(transaction.platformFee / 100)} (Plataforma)
                          </p>
                          {transaction.stripeFee > 0 && (
                            <p className="text-muted-foreground">
                              -{formatPriceMXN(transaction.stripeFee / 100)} (Stripe)
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="border border-border bg-card/90">
            <CardHeader>
              <CardTitle>Ingresos por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              {data.monthlyRevenue.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay datos de ingresos por mes.</p>
              ) : (
                <div className="space-y-4">
                  {data.monthlyRevenue.map((item) => {
                    const maxRevenue = Math.max(...data.monthlyRevenue.map((e) => e.revenue), 1);
                    const percentage = (item.revenue / maxRevenue) * 100;
                    return (
                      <div key={item.month} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-foreground min-w-[100px] capitalize">
                              {item.month}
                            </span>
                            <Badge variant="outline">
                              {item.transactions} transacciones
                            </Badge>
                          </div>
                          <span className="font-semibold text-foreground">
                            {formatPriceMXN(item.revenue / 100)}
                          </span>
                        </div>
                        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-4">
          <Card className="border border-border bg-card/90">
            <CardHeader>
              <CardTitle>Ingresos por Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              {data.instructorEarnings.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay datos por instructor.</p>
              ) : (
                <div className="space-y-3">
                  {data.instructorEarnings.map((row) => (
                    <div
                      key={row.instructorId}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{row.instructorName}</p>
                          <p className="text-xs text-muted-foreground">
                            {row.transactionsCount} {row.transactionsCount === 1 ? "venta" : "ventas"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-foreground">
                          {formatPriceMXN(row.totalAmount / 100)}
                        </p>
                        <p className="text-xs text-muted-foreground">Total generado</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-l-4 border-l-green-600 bg-green-50 dark:bg-green-950/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="mt-1 h-6 w-6 text-green-600" />
            <div className="flex-1">
              <h3 className="mb-2 font-semibold text-green-900 dark:text-green-100">
                Resumen de Comisiones
              </h3>
              <div className="grid gap-2 text-sm text-green-800 dark:text-green-200">
                <div className="flex justify-between">
                  <span>Comisión de plataforma:</span>
                  <span className="font-semibold">
                    {formatPriceMXN(data.commissionSummary.platformCommission / 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Pagado a instructores:</span>
                  <span className="font-semibold">
                    {formatPriceMXN(data.commissionSummary.paidToInstructors / 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Comisiones de Stripe:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    -{formatPriceMXN(data.commissionSummary.stripeFees / 100)}
                  </span>
                </div>
                <div className="my-1 h-px bg-green-200 dark:bg-green-800" />
                <div className="flex justify-between text-base font-bold">
                  <span>Neto para la plataforma:</span>
                  <span>{formatPriceMXN(data.commissionSummary.netPlatform / 100)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
