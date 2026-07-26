export const dynamic = "force-dynamic";

import Link from "next/link";
import { loadAdminStats, loadAdminActivity } from "@/app/actions/admin-actions";
import type { AdminActivityItem } from "@/lib/admin-service";
import { PageHeader } from "@/components/shared/page-header";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  UserPlus,
  BookOpen,
  MessageSquareWarning,
  FileEdit,
  Building2,
  Star,
  GraduationCap,
} from "lucide-react";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Fecha fija en horario de CDMX — evita desajustes entre servidor y navegador. */
function fecha(iso: string): string {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Mexico_City",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(new Date(iso));
  const g = (t: Intl.DateTimeFormatPartTypes) => p.find((x) => x.type === t)?.value ?? "";
  return `${Number(g("day"))} de ${MESES[Number(g("month")) - 1] ?? ""}`;
}

const mxn = (n: number) => `$${n.toLocaleString("es-MX")} MXN`;

const ACTIVITY_ICON: Record<AdminActivityItem["kind"], typeof UserPlus> = {
  signup: UserPlus,
  enrollment: GraduationCap,
  review: Star,
  course: BookOpen,
};

export default async function AdminDashboardPage() {
  // Si algo falla, se muestra el aviso en pantalla en vez de fingir ceros:
  // un panel que dice "0 usuarios" teniendo 72 es peor que uno que avisa.
  let statsData: Awaited<ReturnType<typeof loadAdminStats>> | null = null;
  let activity: AdminActivityItem[] = [];
  let loadError = false;

  try {
    [statsData, activity] = await Promise.all([loadAdminStats(), loadAdminActivity()]);
  } catch (error) {
    console.error("[admin] No se pudieron cargar las métricas:", error);
    loadError = true;
  }

  if (loadError || !statsData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Administración" description="Resumen de la plataforma" />
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="font-medium text-foreground">No se pudieron cargar las métricas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vuelve a cargar la página. Si sigue igual, revisa la conexión con la base de datos.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const s = statsData;

  const stats: StatItem[] = [
    {
      title: "Usuarios",
      value: String(s.totalUsers),
      description: `${s.students} alumnos · ${s.instructors} instructores`,
      iconName: "Users",
      iconColor: "text-blue-600",
    },
    {
      title: "Cursos publicados",
      value: String(s.publishedCourses),
      description: `${s.draftCourses} en borrador · ${s.totalCourses} en total`,
      iconName: "BookOpenCheck",
      iconColor: "text-green-600",
    },
    {
      title: "Inscripciones",
      value: String(s.totalEnrollments),
      description: `${s.certificates} certificados emitidos`,
      iconName: "TrendingUp",
      iconColor: "text-orange-600",
    },
    {
      title: "Ingresos cobrados",
      value: mxn(s.realRevenue),
      // El valor de catálogo NO es dinero cobrado: se aclara para no confundirlos.
      description: `Valor de catálogo: ${mxn(s.estimatedRevenue)}`,
      iconName: "DollarSign",
      iconColor: "text-purple-600",
    },
  ];

  const atencion = [
    {
      label: "Solicitudes de instructor",
      value: s.pendingApplications,
      hint: "esperan tu revisión",
      href: "/admin/instructor-applications",
      icon: UserPlus,
    },
    {
      label: "Reseñas de 1–2 estrellas",
      value: s.lowReviews,
      hint: "pueden requerir atención",
      href: "/admin/reviews",
      icon: MessageSquareWarning,
    },
    {
      label: "Cursos en borrador",
      value: s.draftCourses,
      hint: "sin publicar",
      href: "/admin/courses",
      icon: FileEdit,
    },
    {
      label: "Empresas activas",
      value: s.activeOrganizations,
      hint: "con suscripción vigente",
      href: "/admin/business",
      icon: Building2,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Administración" description="Resumen de la plataforma" />

      <StatsGrid stats={stats} columns={4} />

      {/* ── Lo que pide una decisión ─────────────────────────────── */}
      <Card className="border border-border bg-card/90">
        <CardHeader>
          <CardTitle className="text-base">Requiere tu atención</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {atencion.map((a) => {
            const Icon = a.icon;
            const activo = a.value > 0;
            return (
              <Link
                key={a.label}
                href={a.href}
                className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary hover:bg-muted/40"
              >
                <Icon
                  className={`mt-0.5 h-4 w-4 shrink-0 ${
                    activo ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <div className="min-w-0">
                  <p
                    className={`text-2xl font-bold leading-none ${
                      activo ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {a.value}
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.hint}</p>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* ── Actividad reciente ─────────────────────────────────── */}
        <Card className="border border-border bg-card/90 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay movimientos en la plataforma.
              </p>
            ) : (
              <ul className="space-y-3">
                {activity.map((a, i) => {
                  const Icon = ACTIVITY_ICON[a.kind];
                  return (
                    <li key={`${a.at}-${i}`} className="flex items-start gap-3 text-sm">
                      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <Link href={a.link} className="min-w-0 flex-1 hover:text-primary">
                        <span className="text-foreground">{a.text}</span>
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {fecha(a.at)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* ── Accesos directos ───────────────────────────────────── */}
        <Card className="border border-border bg-card/90">
          <CardHeader>
            <CardTitle className="text-base">Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="default" asChild>
              <Link href="/admin/users">Gestionar usuarios</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/courses">Revisar cursos</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/finances">Ver finanzas</Link>
            </Button>
            <Button className="w-full" variant="outline" asChild>
              <Link href="/admin/kpis">Ver KPIs</Link>
            </Button>
            {s.averageRating !== null && (
              <p className="pt-2 text-center text-xs text-muted-foreground">
                Calificación promedio:{" "}
                <span className="font-semibold text-foreground">
                  {s.averageRating.toFixed(1)} ★
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
