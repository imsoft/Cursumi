"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { Users, BookOpenCheck, TrendingUp, DollarSign } from "lucide-react";

const stats: StatItem[] = [
  {
    title: "Total de usuarios",
    value: "1,234",
    description: "+12% desde el mes pasado",
    icon: Users,
    iconColor: "text-blue-600",
    trend: {
      value: "+12% desde el mes pasado",
      isPositive: true,
    },
  },
  {
    title: "Cursos activos",
    value: "89",
    description: "+5 nuevos esta semana",
    icon: BookOpenCheck,
    iconColor: "text-green-600",
    trend: {
      value: "+5 nuevos esta semana",
      isPositive: true,
    },
  },
  {
    title: "Ingresos",
    value: "$45,231",
    description: "+20% desde el mes pasado",
    icon: DollarSign,
    iconColor: "text-purple-600",
    trend: {
      value: "+20% desde el mes pasado",
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

import { PageHeader } from "@/components/shared/page-header";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard de Administración"
        description="Resumen general de la plataforma Cursumi"
      />

      <StatsGrid stats={stats} columns={4} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Nuevo curso publicado</p>
                  <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                </div>
                <Button variant="outline" size="sm">
                  Ver
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Nuevo instructor registrado</p>
                  <p className="text-xs text-muted-foreground">Hace 5 horas</p>
                </div>
                <Button variant="outline" size="sm">
                  Ver
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="default">
              Gestionar usuarios
            </Button>
            <Button className="w-full" variant="outline">
              Revisar cursos
            </Button>
            <Button className="w-full" variant="outline">
              Ver reportes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

