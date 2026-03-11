"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { DollarSign, TrendingUp, Calendar, Download, CreditCard, Users, Percent } from "lucide-react";
import { formatPriceMXN } from "@/lib/utils";
import Link from "next/link";

// Mock data - en producción vendría de una API
const financialStats: StatItem[] = [
  {
    title: "Ingresos totales",
    value: "$125,450",
    description: "+18% desde el mes pasado",
    icon: DollarSign,
    iconColor: "text-green-600",
    trend: {
      value: "+18%",
      isPositive: true,
    },
  },
  {
    title: "Este mes",
    value: "$45,230",
    description: "Ingresos de diciembre",
    icon: Calendar,
    iconColor: "text-blue-600",
    trend: {
      value: "+12%",
      isPositive: true,
    },
  },
  {
    title: "Comisión plataforma",
    value: "$9,046",
    description: "20% de los cursos vendidos",
    icon: Percent,
    iconColor: "text-purple-600",
    trend: {
      value: "20% promedio",
      isPositive: true,
    },
  },
  {
    title: "Transacciones",
    value: "342",
    description: "Pagos procesados este mes",
    icon: CreditCard,
    iconColor: "text-orange-600",
    trend: {
      value: "+24",
      isPositive: true,
    },
  },
];

const recentTransactions = [
  {
    id: "1",
    course: "Introducción a JavaScript",
    instructor: "Ana López",
    student: "Carlos Pérez",
    amount: 1500,
    platformFee: 300,
    stripeFee: 57.48,
    date: "2024-12-08",
    status: "completed",
  },
  {
    id: "2",
    course: "Marketing Digital Avanzado",
    instructor: "Juan Martínez",
    student: "María González",
    amount: 2000,
    platformFee: 400,
    stripeFee: 76.64,
    date: "2024-12-07",
    status: "completed",
  },
  {
    id: "3",
    course: "Diseño UX/UI Profesional",
    instructor: "Laura Sánchez",
    student: "Pedro Ramírez",
    amount: 2500,
    platformFee: 500,
    stripeFee: 95.80,
    date: "2024-12-07",
    status: "pending",
  },
  {
    id: "4",
    course: "Python para Data Science",
    instructor: "Roberto García",
    student: "Sofia Torres",
    amount: 3000,
    platformFee: 600,
    stripeFee: 114.96,
    date: "2024-12-06",
    status: "completed",
  },
  {
    id: "5",
    course: "Fotografía Profesional",
    instructor: "Diana Morales",
    student: "Luis Hernández",
    amount: 1800,
    platformFee: 360,
    stripeFee: 68.98,
    date: "2024-12-06",
    status: "completed",
  },
];

const monthlyRevenue = [
  { month: "Julio", revenue: 32000, transactions: 156 },
  { month: "Agosto", revenue: 38000, transactions: 182 },
  { month: "Septiembre", revenue: 42000, transactions: 198 },
  { month: "Octubre", revenue: 48000, transactions: 215 },
  { month: "Noviembre", revenue: 52000, transactions: 234 },
  { month: "Diciembre", revenue: 45230, transactions: 204 },
];

export default function FinancesPage() {
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

      <StatsGrid stats={financialStats} columns={4} />

      {/* Tabs */}
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
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
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
                        {formatPriceMXN(transaction.amount)}
                      </p>
                      <div className="text-xs space-y-0.5">
                        <p className="text-green-600 dark:text-green-400 font-semibold">
                          +{formatPriceMXN(transaction.platformFee)} (Plataforma)
                        </p>
                        <p className="text-muted-foreground">
                          -{formatPriceMXN(transaction.stripeFee)} (Stripe)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card className="border border-border bg-card/90">
            <CardHeader>
              <CardTitle>Ingresos por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyRevenue.map((item) => {
                  const maxRevenue = Math.max(...monthlyRevenue.map((e) => e.revenue));
                  const percentage = (item.revenue / maxRevenue) * 100;

                  return (
                    <div key={item.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-foreground min-w-[100px]">
                            {item.month}
                          </span>
                          <Badge variant="outline">
                            {item.transactions} transacciones
                          </Badge>
                        </div>
                        <span className="font-semibold text-foreground">
                          {formatPriceMXN(item.revenue)}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructors" className="space-y-4">
          <Card className="border border-border bg-card/90">
            <CardHeader>
              <CardTitle>Ingresos por Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Ana López</p>
                      <p className="text-xs text-muted-foreground">45 cursos vendidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{formatPriceMXN(67500)}</p>
                    <p className="text-xs text-muted-foreground">Total generado</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Juan Martínez</p>
                      <p className="text-xs text-muted-foreground">38 cursos vendidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{formatPriceMXN(76000)}</p>
                    <p className="text-xs text-muted-foreground">Total generado</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Laura Sánchez</p>
                      <p className="text-xs text-muted-foreground">52 cursos vendidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{formatPriceMXN(130000)}</p>
                    <p className="text-xs text-muted-foreground">Total generado</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Resumen de comisiones */}
      <Card className="border-l-4 border-l-green-600 bg-green-50 dark:bg-green-950/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-6 w-6 text-green-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Resumen de Comisiones
              </h3>
              <div className="grid gap-2 text-sm text-green-800 dark:text-green-200">
                <div className="flex justify-between">
                  <span>Comisión de plataforma (20%):</span>
                  <span className="font-semibold">{formatPriceMXN(9046)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pagado a instructores:</span>
                  <span className="font-semibold">{formatPriceMXN(36184)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Comisiones de Stripe:</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">-{formatPriceMXN(1632.72)}</span>
                </div>
                <div className="h-px bg-green-200 dark:bg-green-800 my-1" />
                <div className="flex justify-between font-bold text-base">
                  <span>Neto para la plataforma:</span>
                  <span>{formatPriceMXN(7413.28)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

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
