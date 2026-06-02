"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatsGrid, type StatItem } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Stats = {
  totalUsers: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  estimatedRevenue: number;
};

type Analytics = {
  revenueByMonth: { month: string; amount: number }[];
  usersByMonth: { month: string; users: number }[];
};

function buildStats(s: Stats): StatItem[] {
  return [
    { title: "Total de usuarios", value: String(s.totalUsers ?? 0), description: "Usuarios registrados", iconName: "Users", iconColor: "text-blue-600" },
    { title: "Cursos publicados", value: String(s.publishedCourses ?? 0), description: `${s.draftCourses ?? 0} en borrador`, iconName: "BookOpenCheck", iconColor: "text-green-600" },
    { title: "Inscripciones", value: String(s.totalEnrollments ?? 0), description: "Total de inscripciones", iconName: "TrendingUp", iconColor: "text-orange-600" },
    { title: "Ingresos estimados", value: `$${Number(s.estimatedRevenue ?? 0).toLocaleString("es-MX")}`, description: "Precio × inscripciones", iconName: "DollarSign", iconColor: "text-purple-600" },
  ];
}

export function AnalyticsPageClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/stats", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Stats"))))
      .then((data) => { if (!cancelled) setStats(data); })
      .catch(() => { if (!cancelled) setError("Error al cargar estadísticas"); });
    fetch("/api/admin/analytics", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Analytics"))))
      .then((data) => { if (!cancelled) setAnalytics(data); })
      .catch(() => { if (!cancelled) setError("Error al cargar analíticas"); });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analíticas" description="Métricas y estadísticas de la plataforma" />
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Analíticas" description="Métricas y estadísticas de la plataforma" />

      {stats ? (
        <StatsGrid stats={buildStats(stats)} columns={4} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-border bg-card/90">
              <CardHeader><div className="h-4 w-24 animate-pulse rounded bg-muted" /></CardHeader>
              <CardContent><div className="h-8 w-16 animate-pulse rounded bg-muted" /></CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Ingresos por mes</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.revenueByMonth?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-muted-foreground">Mes</th>
                    <th className="py-2 text-right font-medium text-muted-foreground">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.revenueByMonth.map(({ month, amount }) => (
                    <tr key={month} className="border-b border-border/50">
                      <td className="py-2">{month}</td>
                      <td className="py-2 text-right font-medium">${amount.toLocaleString("es-MX")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-4 text-sm text-muted-foreground">No hay datos</p>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Usuarios nuevos por mes</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.usersByMonth?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 text-left font-medium text-muted-foreground">Mes</th>
                    <th className="py-2 text-right font-medium text-muted-foreground">Usuarios</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.usersByMonth.map(({ month, users }) => (
                    <tr key={month} className="border-b border-border/50">
                      <td className="py-2">{month}</td>
                      <td className="py-2 text-right font-medium">{users}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="py-4 text-sm text-muted-foreground">No hay datos</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
