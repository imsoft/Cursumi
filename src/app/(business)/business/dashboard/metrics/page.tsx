"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpenCheck, BarChart3, Award } from "lucide-react";

interface CourseBreakdown {
  courseId: string;
  enrolled: number;
  avgProgress: number;
  completed: number;
}

interface Metrics {
  memberCount: number;
  courseAccessCount: number;
  totalEnrollments: number;
  avgProgress: number;
  completedEnrollments: number;
  certificates: number;
  courseBreakdown: CourseBreakdown[];
}

interface CourseDetail {
  id: string;
  title: string;
}

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [courses, setCourses] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/business/metrics").then((r) => r.json()),
      fetch("/api/business/courses").then((r) => r.json()),
    ])
      .then(([m, c]) => {
        setMetrics(m);
        const map = new Map<string, string>();
        (c.courses || []).forEach((course: CourseDetail & { title: string }) => {
          map.set(course.id, course.title);
        });
        setCourses(map);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const kpis = [
    { label: "Empleados", value: metrics.memberCount, icon: Users },
    { label: "Cursos activos", value: metrics.courseAccessCount, icon: BookOpenCheck },
    { label: "Progreso promedio", value: `${metrics.avgProgress}%`, icon: BarChart3 },
    { label: "Certificados", value: metrics.certificates, icon: Award },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Métricas" description="Visualiza el avance de tu equipo" />

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

      {/* Per-course breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Avance por curso</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.courseBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay datos de cursos aún.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {metrics.courseBreakdown.map((cb) => (
                <div key={cb.courseId} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {courses.get(cb.courseId) || cb.courseId}
                    </span>
                    <span className="text-muted-foreground">
                      {cb.avgProgress}% · {cb.completed}/{cb.enrolled} completados
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${cb.avgProgress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
