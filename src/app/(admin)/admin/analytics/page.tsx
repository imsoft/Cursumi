"use client";

import { PageHeader } from "@/components/shared/page-header";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Users,
  BookOpenCheck,
  DollarSign,
  Calendar,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Area,
  AreaChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const analyticsStats: StatItem[] = [
  {
    title: "Usuarios activos",
    value: "1,234",
    description: "+12% este mes",
    icon: Users,
    iconColor: "text-blue-600",
    trend: {
      value: "+12% este mes",
      isPositive: true,
    },
  },
  {
    title: "Cursos publicados",
    value: "89",
    description: "+5 nuevos",
    icon: BookOpenCheck,
    iconColor: "text-green-600",
    trend: {
      value: "+5 nuevos",
      isPositive: true,
    },
  },
  {
    title: "Ingresos totales",
    value: "$45,231",
    description: "+20% este mes",
    icon: DollarSign,
    iconColor: "text-purple-600",
    trend: {
      value: "+20% este mes",
      isPositive: true,
    },
  },
  {
    title: "Tasa de crecimiento",
    value: "+18.2%",
    description: "Comparado al mes anterior",
    icon: TrendingUp,
    iconColor: "text-orange-600",
    trend: {
      value: "Comparado al mes anterior",
      isPositive: true,
    },
  },
];

const usersData = [
  { month: "Ene", usuarios: 850, nuevos: 120 },
  { month: "Feb", usuarios: 920, nuevos: 95 },
  { month: "Mar", usuarios: 1050, nuevos: 130 },
  { month: "Abr", usuarios: 1120, nuevos: 110 },
  { month: "May", usuarios: 1180, nuevos: 85 },
  { month: "Jun", usuarios: 1234, nuevos: 100 },
];

const revenueData = [
  { month: "Ene", ingresos: 8500 },
  { month: "Feb", ingresos: 10200 },
  { month: "Mar", ingresos: 12800 },
  { month: "Abr", ingresos: 15200 },
  { month: "May", ingresos: 18900 },
  { month: "Jun", ingresos: 22300 },
];

const coursesByCategory = [
  { category: "Programación", cursos: 25 },
  { category: "Marketing", cursos: 18 },
  { category: "Diseño", cursos: 22 },
  { category: "Negocios", cursos: 15 },
  { category: "Habilidades blandas", cursos: 9 },
];

const growthData = [
  { month: "Ene", crecimiento: 12 },
  { month: "Feb", crecimiento: 15 },
  { month: "Mar", crecimiento: 18 },
  { month: "Abr", crecimiento: 20 },
  { month: "May", crecimiento: 22 },
  { month: "Jun", crecimiento: 18 },
];

const usersChartConfig = {
  usuarios: {
    label: "Usuarios totales",
    color: "oklch(0.811 0.111 293.571)",
  },
  nuevos: {
    label: "Nuevos usuarios",
    color: "oklch(0.606 0.25 292.717)",
  },
} satisfies ChartConfig;

const revenueChartConfig = {
  ingresos: {
    label: "Ingresos",
    color: "oklch(0.541 0.281 293.009)",
  },
} satisfies ChartConfig;

const coursesChartConfig = {
  cursos: {
    label: "Cursos",
    color: "oklch(0.491 0.27 292.581)",
  },
} satisfies ChartConfig;

const growthChartConfig = {
  crecimiento: {
    label: "Crecimiento (%)",
    color: "oklch(0.432 0.232 292.759)",
  },
} satisfies ChartConfig;

const recentActivity = [
  {
    id: "1",
    type: "course_published",
    title: "Nuevo curso publicado",
    description: "Introducción a JavaScript por Ana López",
    time: "Hace 2 horas",
  },
  {
    id: "2",
    type: "user_registered",
    title: "Nuevo instructor registrado",
    description: "Carlos Méndez se unió como instructor",
    time: "Hace 5 horas",
  },
  {
    id: "3",
    type: "course_completed",
    title: "Curso completado",
    description: "25 estudiantes completaron Marketing de contenidos",
    time: "Hace 1 día",
  },
  {
    id: "4",
    type: "payment_received",
    title: "Pago recibido",
    description: "$1,250 en nuevos pagos",
    time: "Hace 2 días",
  },
];

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Analíticas y Reportes"
        description="Métricas y estadísticas de la plataforma Cursumi"
      />

      <StatsGrid stats={analyticsStats} columns={4} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Crecimiento de usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={usersChartConfig} className="min-h-[200px] w-full">
              <BarChart accessibilityLayer data={usersData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="usuarios" fill="var(--color-usuarios)" radius={4} />
                <Bar dataKey="nuevos" fill="var(--color-nuevos)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Ingresos mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={revenueChartConfig} className="min-h-[200px] w-full">
              <AreaChart accessibilityLayer data={revenueData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  dataKey="ingresos"
                  type="monotone"
                  fill="var(--color-ingresos)"
                  fillOpacity={0.4}
                  stroke="var(--color-ingresos)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Cursos por categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={coursesChartConfig} className="min-h-[200px] w-full">
              <BarChart
                accessibilityLayer
                data={coursesByCategory}
                layout="vertical"
              >
                <CartesianGrid horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis
                  dataKey="category"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="cursos"
                  fill="var(--color-cursos)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Tasa de crecimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={growthChartConfig} className="min-h-[200px] w-full">
              <LineChart accessibilityLayer data={growthData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  dataKey="crecimiento"
                  type="monotone"
                  stroke="var(--color-crecimiento)"
                  strokeWidth={2}
                  dot={{ fill: "var(--color-crecimiento)", r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    <Calendar className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Métricas clave</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasa de conversión</span>
                <span className="text-sm font-semibold text-foreground">12.5%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cursos promedio por instructor</span>
                <span className="text-sm font-semibold text-foreground">3.2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tiempo promedio de curso</span>
                <span className="text-sm font-semibold text-foreground">6.5 semanas</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tasa de finalización</span>
                <span className="text-sm font-semibold text-foreground">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle>Reportes disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <BarChart3 className="mr-2 h-4 w-4" />
              Reporte de usuarios
            </Button>
            <Button variant="outline" className="justify-start">
              <BookOpenCheck className="mr-2 h-4 w-4" />
              Reporte de cursos
            </Button>
            <Button variant="outline" className="justify-start">
              <DollarSign className="mr-2 h-4 w-4" />
              Reporte financiero
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
