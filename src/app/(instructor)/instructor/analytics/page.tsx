"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, TrendingUp, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type AnalyticsResponse = {
  totalCourses: number;
  publishedCourses: number;
  totalStudents: number;
  avgProgress: number;
  earnings: {
    total: number;
    thisMonth: number;
    enrollments: number;
    courses: number;
    monthly: { month: string; amount: number }[];
  };
};

type InstructorCourse = {
  id: string;
  title: string;
  modality: "virtual" | "presencial";
  status: "draft" | "published" | "archived";
  studentsCount: number;
  category: string;
  price?: number;
  startDate?: string;
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [analyticsRes, coursesRes] = await Promise.all([
          fetch("/api/instructor/analytics", { cache: "no-store" }),
          fetch("/api/instructor/courses", { cache: "no-store" }),
        ]);
        if (!analyticsRes.ok) {
          throw new Error("No pudimos cargar las analíticas");
        }
        const analyticsData = (await analyticsRes.json()) as AnalyticsResponse;
        setAnalytics(analyticsData);

        if (coursesRes.ok) {
          const coursesData = (await coursesRes.json()) as InstructorCourse[];
          setCourses(coursesData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar datos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const publishedCourses = useMemo(
    () => courses.filter((c) => c.status === "published"),
    [courses],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Analíticas de cursos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitorea el rendimiento y engagement de tus cursos
        </p>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalStudents ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">En todos tus cursos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de finalización</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.avgProgress ?? 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">Promedio de todos los cursos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos totales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics ? `$${analytics.earnings.total}` : "$0"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Este mes: {analytics ? `$${analytics.earnings.thisMonth}` : "$0"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos publicados</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.publishedCourses ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">De {analytics?.totalCourses ?? 0} cursos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Por curso</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analíticas por curso</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-muted-foreground">Cargando cursos...</div>
              ) : publishedCourses.length === 0 ? (
                <div className="text-muted-foreground">No tienes cursos publicados aún.</div>
              ) : (
                <div className="space-y-4">
                  {publishedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="rounded-lg border border-border bg-card p-4 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{course.title}</h3>
                          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {course.studentsCount} estudiantes
                            </span>
                            <Badge variant="outline">{course.modality}</Badge>
                          </div>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Estado</span>
                        <Badge variant="outline">{course.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
