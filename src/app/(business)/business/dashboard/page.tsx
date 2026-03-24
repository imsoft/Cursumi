"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpenCheck, BarChart3, Award, UserPlus, Plus } from "lucide-react";

interface Metrics {
  memberCount: number;
  courseAccessCount: number;
  avgProgress: number;
  certificates: number;
  totalEnrollments: number;
  completedEnrollments: number;
}

export default function BusinessDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/business/metrics")
      .then((r) => r.json())
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, []);

  const kpis = metrics
    ? [
        { label: "Empleados", value: metrics.memberCount, icon: Users },
        { label: "Cursos activos", value: metrics.courseAccessCount, icon: BookOpenCheck },
        { label: "Progreso promedio", value: `${metrics.avgProgress}%`, icon: BarChart3 },
        { label: "Certificados", value: metrics.certificates, icon: Award },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Resumen de la capacitación de tu empresa"
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="flex h-24 items-center justify-center">
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Card key={kpi.label}>
                <CardContent className="flex items-center gap-4 pt-6">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href="/business/dashboard/employees">
                <UserPlus className="h-4 w-4" />
                Invitar empleado
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href="/business/dashboard/courses">
                <Plus className="h-4 w-4" />
                Agregar curso
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline" className="gap-2">
              <Link href="/business/dashboard/metrics">
                <BarChart3 className="h-4 w-4" />
                Ver métricas
              </Link>
            </Button>
          </CardContent>
        </Card>

        {metrics && metrics.completedEnrollments > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen de completado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">Inscripciones completadas</span>
                    <span className="font-medium">
                      {metrics.completedEnrollments} / {metrics.totalEnrollments}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${metrics.totalEnrollments > 0 ? (metrics.completedEnrollments / metrics.totalEnrollments) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
