import { loadAdminAnalytics, loadAdminStats } from "@/app/actions/admin-actions";
import { PageHeader } from "@/components/shared/page-header";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { AdminAnalyticsClient } from "@/components/admin/admin-analytics-client";
import { Users, BookOpenCheck, TrendingUp, DollarSign } from "lucide-react";

export default async function AdminAnalyticsPage() {
  const statsData = await loadAdminStats();
  const analytics = await loadAdminAnalytics();

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
        title="Analíticas"
        description="Métricas y estadísticas de la plataforma"
      />

      <StatsGrid stats={stats} columns={4} />
      <AdminAnalyticsClient
        revenueByMonth={analytics.revenueByMonth}
        usersByMonth={analytics.usersByMonth}
      />
    </div>
  );
}
