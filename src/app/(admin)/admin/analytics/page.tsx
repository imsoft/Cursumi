import { loadAdminAnalytics, loadAdminStats } from "@/app/actions/admin-actions";
import { PageHeader } from "@/components/shared/page-header";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { AdminAnalyticsClient } from "@/components/admin/admin-analytics-client";
export default async function AdminAnalyticsPage() {
  const statsData = await loadAdminStats();
  const analytics = await loadAdminAnalytics();

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
