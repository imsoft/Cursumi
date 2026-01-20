import { loadAdminStats } from "@/app/actions/admin-actions";
import { PageHeader } from "@/components/shared/page-header";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpenCheck, TrendingUp, DollarSign } from "lucide-react";

export default async function AdminDashboardPage() {
  const statsData = await loadAdminStats();

  const stats: StatItem[] = [
    {
      title: "Total de usuarios",
      value: statsData.totalUsers.toString(),
      description: "Usuarios registrados",
      icon: Users,
      iconColor: "text-blue-600",
    },
    {
      title: "Cursos publicados",
      value: statsData.publishedCourses.toString(),
      description: `${statsData.draftCourses} en borrador`,
      icon: BookOpenCheck,
      iconColor: "text-green-600",
    },
    {
      title: "Inscripciones",
      value: statsData.totalEnrollments.toString(),
      description: "Total de enrollments",
      icon: TrendingUp,
      iconColor: "text-orange-600",
    },
    {
      title: "Ingresos estimados",
      value: `$${statsData.estimatedRevenue.toLocaleString("es-MX")}`,
      description: "Precio * inscripciones",
      icon: DollarSign,
      iconColor: "text-purple-600",
    },
  ];

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
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>Conecta un feed real de actividad cuando haya eventos.</p>
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
