export const dynamic = "force-dynamic";

import { loadAdminStats } from "@/app/actions/admin-actions";
import { PageHeader } from "@/components/shared/page-header";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const defaultStats = {
  totalUsers: 0,
  totalCourses: 0,
  publishedCourses: 0,
  draftCourses: 0,
  totalEnrollments: 0,
  estimatedRevenue: 0,
};

export default async function AdminDashboardPage() {
  let statsData;
  try {
    statsData = await loadAdminStats();
  } catch {
    statsData = defaultStats;
  }
  statsData = statsData ?? defaultStats;

  const stats: StatItem[] = [
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
      description: "Inscripciones totales",
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administración"
        description="Resumen de la plataforma"
      />

      <StatsGrid stats={stats} columns={4} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>Próximamente: actividad reciente.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="default" asChild>
              <Link href="/admin/users">Gestionar usuarios</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/courses">Revisar cursos</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/kpis">Ver KPIs</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
