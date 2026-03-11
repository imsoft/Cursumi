"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { AdminAnalyticsChartsLazy } from "@/components/admin/admin-analytics-charts-lazy";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

type AdminStats = {
  totalUsers: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  totalEnrollments: number;
  estimatedRevenue: number;
};

type AdminAnalytics = {
  revenueByMonth: { month: string; amount: number }[];
  usersByMonth: { month: string; users: number }[];
};

function buildStats(statsData: AdminStats): StatItem[] {
  return [
    {
      title: "Total de usuarios",
      value: String(statsData.totalUsers ?? 0),
      description: "Usuarios registrados",
      iconName: "Users",
      iconColor: "text-blue-600",
    },
    {
      title: "Cursos publicados",
      value: String(statsData.publishedCourses ?? 0),
      description: `${statsData.draftCourses ?? 0} en borrador`,
      iconName: "BookOpenCheck",
      iconColor: "text-green-600",
    },
    {
      title: "Inscripciones",
      value: String(statsData.totalEnrollments ?? 0),
      description: "Total de enrollments",
      iconName: "TrendingUp",
      iconColor: "text-orange-600",
    },
    {
      title: "Ingresos estimados",
      value: `$${Number(statsData.estimatedRevenue ?? 0).toLocaleString("es-MX")}`,
      description: "Precio * inscripciones",
      iconName: "DollarSign",
      iconColor: "text-purple-600",
    },
  ];
}

const emptyAnalytics: AdminAnalytics = {
  revenueByMonth: [],
  usersByMonth: [],
};

export function AdminAnalyticsPageClient() {
  const [stats, setStats] = useState<StatItem[] | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [showCharts, setShowCharts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let rafId = 0;

    Promise.all([
      fetch("/api/admin/stats", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Stats failed"))
      ),
      fetch("/api/admin/analytics", { cache: "no-store" }).then((r) =>
        r.ok ? r.json() : Promise.reject(new Error("Analytics failed"))
      ),
    ])
      .then(([statsData, analyticsData]) => {
        if (cancelled) return;
        setStats(buildStats(statsData as AdminStats));
        setAnalytics((analyticsData as AdminAnalytics) ?? emptyAnalytics);
        rafId = requestAnimationFrame(() => {
          if (!cancelled) setShowCharts(true);
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error al cargar");
      });

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
    };
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

      {stats === null ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border border-border bg-card/90">
              <CardHeader>
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <StatsGrid stats={stats} columns={4} />
      )}

      {analytics === null || !showCharts ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border border-border bg-card/90">
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="min-h-[200px] w-full animate-pulse rounded bg-muted/50" />
            </CardContent>
          </Card>
          <Card className="border border-border bg-card/90">
            <CardHeader>
              <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="min-h-[200px] w-full animate-pulse rounded bg-muted/50" />
            </CardContent>
          </Card>
        </div>
      ) : (
        <AdminAnalyticsChartsLazy
          revenueByMonth={analytics.revenueByMonth}
          usersByMonth={analytics.usersByMonth}
        />
      )}
    </div>
  );
}
