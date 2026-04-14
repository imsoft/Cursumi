"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingDown, CheckCircle2, BarChart3, AlertTriangle } from "lucide-react";
import type { CourseAnalytics, LessonFunnelItem } from "@/app/api/instructor/courses/[id]/analytics/route";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ProgressBar({ value, max = 100, color = "bg-primary" }: { value: number; max?: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
      <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className="rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function lessonTypeLabel(type: string) {
  const map: Record<string, string> = {
    video: "Video",
    text: "Texto",
    quiz: "Quiz",
    assignment: "Tarea",
    section_quiz: "Test de sección",
    section_minigame: "Minijuego",
  };
  return map[type] ?? type;
}

// ─── Funnel ───────────────────────────────────────────────────────────────────

function LessonFunnelRow({
  item,
  totalEnrolled,
  isDropoff,
}: {
  item: LessonFunnelItem;
  totalEnrolled: number;
  isDropoff: boolean;
}) {
  const rate = item.completionRate;
  const barColor =
    rate >= 70 ? "bg-emerald-500" : rate >= 40 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className={`rounded-lg border px-4 py-3 ${isDropoff ? "border-amber-400 bg-amber-50 dark:bg-amber-900/10" : "border-border bg-card"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {isDropoff && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
            <span className="truncate text-sm font-medium text-foreground">{item.lessonTitle}</span>
            <Badge variant="outline" className="text-xs shrink-0">{lessonTypeLabel(item.lessonType)}</Badge>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">{item.sectionTitle}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-foreground">{rate}%</p>
          <p className="text-xs text-muted-foreground">{item.completions}/{totalEnrolled}</p>
        </div>
      </div>
      <div className="mt-2">
        <ProgressBar value={item.completions} max={totalEnrolled} color={barColor} />
      </div>
      {item.avgScore != null && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          Puntuación promedio: <strong className="text-foreground">{item.avgScore}%</strong>
        </p>
      )}
    </div>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────

export function AnalyticsDashboard({
  courseId,
  totalEnrolled,
}: {
  courseId: string;
  totalEnrolled: number;
}) {
  const [data, setData] = useState<CourseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/instructor/courses/${courseId}/analytics`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<CourseAnalytics>;
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [courseId]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="animate-pulse space-y-2">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-8 w-16 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          No se pudieron cargar los datos de analytics.
        </CardContent>
      </Card>
    );
  }

  const dropoffLesson = data.lessonFunnel.find((l) => l.lessonId === data.dropoffLessonId);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Inscritos"
          value={data.totalEnrolled}
          icon={Users}
        />
        <StatCard
          label="Completaron el curso"
          value={`${data.completionRate}%`}
          sub={`${data.completed} de ${data.totalEnrolled} estudiantes`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Progreso promedio"
          value={`${data.avgProgress}%`}
          sub="De todos los inscritos activos"
          icon={BarChart3}
        />
        {dropoffLesson ? (
          <StatCard
            label="Mayor abandono"
            value={`${dropoffLesson.completionRate}%`}
            sub={`En "${dropoffLesson.lessonTitle.slice(0, 30)}..."`}
            icon={TrendingDown}
          />
        ) : (
          <StatCard
            label="Mayor abandono"
            value="—"
            sub="Sin datos aún"
            icon={TrendingDown}
          />
        )}
      </div>

      {/* Tasas de aprobación de quizzes de sección */}
      {data.sectionQuizPassRates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quizzes de sección</CardTitle>
            <p className="text-sm text-muted-foreground font-normal mt-1">
              Tasa de aprobación por sección
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.sectionQuizPassRates.map((sq) => (
              <div key={sq.sectionId}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{sq.sectionTitle}</span>
                  <span className="text-muted-foreground">
                    {sq.passRate}% ({sq.attempts} intentos)
                  </span>
                </div>
                <ProgressBar
                  value={sq.passRate}
                  max={100}
                  color={sq.passRate >= 70 ? "bg-emerald-500" : sq.passRate >= 40 ? "bg-amber-500" : "bg-red-500"}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Inscripciones por semana */}
      {data.weeklyEnrollments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inscripciones por semana</CardTitle>
            <p className="text-sm text-muted-foreground font-normal mt-1">
              Últimas 12 semanas
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-24">
              {(() => {
                const maxCount = Math.max(...data.weeklyEnrollments.map((w) => w.count), 1);
                return data.weeklyEnrollments.map((w) => (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-1" title={`${w.week}: ${w.count} inscripciones`}>
                    <div
                      className="w-full rounded-t bg-primary/80 min-h-[2px] transition-all"
                      style={{ height: `${Math.max(2, (w.count / maxCount) * 80)}px` }}
                    />
                    <span className="text-[9px] text-muted-foreground rotate-45 origin-left hidden sm:block">
                      {w.week.slice(5)}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funnel de lecciones */}
      {data.lessonFunnel.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Funnel de completitud por lección</CardTitle>
            <p className="text-sm text-muted-foreground font-normal mt-1">
              Porcentaje de estudiantes que completaron cada lección
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.lessonFunnel.map((item) => (
              <LessonFunnelRow
                key={item.lessonId}
                item={item}
                totalEnrolled={data.totalEnrolled}
                isDropoff={item.lessonId === data.dropoffLessonId}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {data.lessonFunnel.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aún no hay datos de progreso. Los analytics aparecerán cuando los estudiantes comiencen a completar lecciones.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
