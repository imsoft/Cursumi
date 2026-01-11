"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Calendar, Download, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatPriceMXN } from "@/lib/utils";

// Mock data - en producción vendría de una API
const mockEarnings = {
  total: 125000,
  thisMonth: 45000,
  lastMonth: 38000,
  pending: 12000,
  paid: 113000,
  growth: 18.4,
};

const mockTransactions = [
  {
    id: "1",
    course: "Introducción a JavaScript",
    student: "Ana López",
    amount: 1500,
    date: "2024-11-25",
    status: "paid",
    type: "sale",
  },
  {
    id: "2",
    course: "Marketing digital para productos",
    student: "Carlos Pérez",
    amount: 2000,
    date: "2024-11-24",
    status: "paid",
    type: "sale",
  },
  {
    id: "3",
    course: "Bootcamp Full Stack",
    student: "María González",
    amount: 5000,
    date: "2024-11-23",
    status: "pending",
    type: "sale",
  },
  {
    id: "4",
    course: "Diseño UX práctico",
    student: "Juan Martínez",
    amount: 1800,
    date: "2024-11-22",
    status: "paid",
    type: "sale",
  },
  {
    id: "5",
    course: "Introducción a JavaScript",
    student: "Laura Sánchez",
    amount: 1500,
    date: "2024-11-21",
    status: "paid",
    type: "sale",
  },
];

const monthlyEarnings = [
  { month: "Enero", amount: 32000 },
  { month: "Febrero", amount: 28000 },
  { month: "Marzo", amount: 35000 },
  { month: "Abril", amount: 42000 },
  { month: "Mayo", amount: 38000 },
  { month: "Junio", amount: 45000 },
];

export default function EarningsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Ingresos generados</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualiza tus ganancias y transacciones en Cursumi
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total ganado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPriceMXN(mockEarnings.total)}</div>
            <p className="text-xs text-muted-foreground mt-1">Desde el inicio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Este mes</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPriceMXN(mockEarnings.thisMonth)}</div>
            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              <span>{mockEarnings.growth}% vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPriceMXN(mockEarnings.paid)}</div>
            <p className="text-xs text-muted-foreground mt-1">Disponible para retiro</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendiente</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPriceMXN(mockEarnings.pending)}</div>
            <p className="text-xs text-muted-foreground mt-1">En proceso de pago</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transacciones</TabsTrigger>
          <TabsTrigger value="monthly">Por mes</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Historial de transacciones</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{transaction.course}</p>
                        <Badge variant={transaction.status === "paid" ? "default" : "outline"}>
                          {transaction.status === "paid" ? "Pagado" : "Pendiente"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Estudiante: {transaction.student}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">
                        {formatPriceMXN(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ingresos por mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyEarnings.map((item, index) => {
                  const maxAmount = Math.max(...monthlyEarnings.map((e) => e.amount));
                  const percentage = (item.amount / maxAmount) * 100;
                  
                  return (
                    <div key={item.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{item.month}</span>
                        <span className="font-semibold text-foreground">
                          {formatPriceMXN(item.amount)}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
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
      </Tabs>
    </div>
  );
}

