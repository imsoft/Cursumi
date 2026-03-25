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

type CourseStudent = {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  progress: number;
  status: string;
  enrolledAt: string;
};

type CourseWithStudents = {
  courseId: string;
  courseTitle: string;
  modality: string;
  status: string;
  students: CourseStudent[];
};

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [courseStudents, setCourseStudents] = useState<CourseWithStudents[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [analyticsRes, coursesRes, studentsRes] = await Promise.all([
          fetch("/api/instructor/analytics", { cache: "no-store" }),
          fetch("/api/instructor/courses", { cache: "no-store" }),
          fetch("/api/instructor/students", { cache: "no-store" }),
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
        if (studentsRes.ok) {
          const studentsData = (await studentsRes.json()) as CourseWithStudents[];
          setCourseStudents(studentsData);
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
    <div className="space-y-6">
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
          <TabsTrigger value="students">Estudiantes por taller</TabsTrigger>
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

        <TabsContent value="students" className="space-y-4">
          {loading ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">Cargando estudiantes...</CardContent>
            </Card>
          ) : courseStudents.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">No tienes talleres con estudiantes aún.</CardContent>
            </Card>
          ) : (
            courseStudents
              .filter((cs) => cs.students.length > 0)
              .map((cs) => (
                <Card key={cs.courseId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{cs.courseTitle}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {cs.modality} · {cs.students.length} {cs.students.length === 1 ? "estudiante" : "estudiantes"}
                        </p>
                      </div>
                      <Badge variant="outline">{cs.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {cs.students.map((s) => (
                        <div
                          key={s.enrollmentId}
                          className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{s.studentName}</p>
                            <p className="text-xs text-muted-foreground">{s.studentEmail}</p>
                          </div>
                          <div className="flex items-center gap-4 ml-4 shrink-0">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                Inscrito: {new Date(s.enrolledAt).toLocaleDateString("es-MX")}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-primary transition-all"
                                  style={{ width: `${Math.min(s.progress, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-foreground w-10 text-right">{s.progress}%</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
