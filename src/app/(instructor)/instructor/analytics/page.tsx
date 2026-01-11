"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BookOpen, TrendingUp, Clock, Eye, Award } from "lucide-react";

// Mock data - en producción vendría de una API
const mockOverallStats = {
  totalStudents: 102,
  totalCourses: 4,
  completionRate: 78,
  averageRating: 4.7,
  totalViews: 1250,
  totalHours: 320,
};

const mockCourseAnalytics = [
  {
    id: "1",
    title: "Introducción a JavaScript",
    students: 25,
    completionRate: 85,
    averageRating: 4.8,
    views: 450,
    revenue: 37500,
  },
  {
    id: "2",
    title: "Marketing digital para productos",
    students: 41,
    completionRate: 72,
    averageRating: 4.6,
    views: 380,
    revenue: 82000,
  },
  {
    id: "3",
    title: "Bootcamp Full Stack",
    students: 32,
    completionRate: 68,
    averageRating: 4.5,
    views: 290,
    revenue: 160000,
  },
  {
    id: "4",
    title: "Diseño UX práctico",
    students: 12,
    completionRate: 90,
    averageRating: 4.9,
    views: 130,
    revenue: 21600,
  },
];

const mockStudentEngagement = [
  { week: "Sem 1", active: 45, completed: 12 },
  { week: "Sem 2", active: 52, completed: 18 },
  { week: "Sem 3", active: 48, completed: 25 },
  { week: "Sem 4", active: 55, completed: 32 },
  { week: "Sem 5", active: 58, completed: 38 },
  { week: "Sem 6", active: 62, completed: 45 },
];

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Analíticas de cursos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitorea el rendimiento y engagement de tus cursos
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total estudiantes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOverallStats.totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">En todos tus cursos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de finalización</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOverallStats.completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Promedio de todos los cursos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calificación promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOverallStats.averageRating}</div>
            <p className="text-xs text-muted-foreground mt-1">De 5.0 estrellas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de vistas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOverallStats.totalViews}</div>
            <p className="text-xs text-muted-foreground mt-1">Visualizaciones de contenido</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas de contenido</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOverallStats.totalHours}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de horas enseñadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cursos activos</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOverallStats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">Publicados y activos</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Por curso</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analíticas por curso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCourseAnalytics.map((course) => (
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
                            {course.students} estudiantes
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {course.views} vistas
                          </span>
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {course.averageRating} ⭐
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Tasa de finalización</span>
                        <span className="font-semibold text-foreground">{course.completionRate}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${course.completionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement de estudiantes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockStudentEngagement.map((item) => {
                  const maxActive = Math.max(...mockStudentEngagement.map((e) => e.active));
                  const activePercentage = (item.active / maxActive) * 100;
                  const completedPercentage = (item.completed / maxActive) * 100;
                  
                  return (
                    <div key={item.week} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{item.week}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">
                            {item.active} activos
                          </span>
                          <span className="text-muted-foreground">
                            {item.completed} completados
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary transition-all"
                              style={{ width: `${activePercentage}%` }}
                            />
                          </div>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-green-600 transition-all"
                              style={{ width: `${completedPercentage}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span>Activos</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-green-600" />
                            <span>Completados</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

