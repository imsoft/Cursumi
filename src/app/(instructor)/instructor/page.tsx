 "use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InstructorDashboardHeader } from "@/components/instructor/instructor-dashboard-header";
import { InstructorStatsCards } from "@/components/instructor/instructor-stats-cards";
import { CourseList, CourseFilterTab } from "@/components/instructor/course-list";
import { UpcomingSessionsCard } from "@/components/instructor/upcoming-sessions-card";
import { InstructorCourse, UpcomingSession } from "@/components/instructor/types";

const mockCourses: InstructorCourse[] = [
  {
    id: "1",
    title: "Introducción a JavaScript",
    modality: "virtual",
    status: "published",
    studentsCount: 25,
    nextSession: "25 de noviembre, 7:00 PM",
    category: "Programación",
  },
  {
    id: "2",
    title: "Diseño UX práctico",
    modality: "presencial",
    status: "draft",
    studentsCount: 12,
    category: "Diseño",
  },
  {
    id: "3",
    title: "Marketing digital para productos",
    modality: "virtual",
    status: "published",
    studentsCount: 41,
    nextSession: "27 de noviembre, 6:00 PM",
    category: "Marketing",
  },
  {
    id: "4",
    title: "Bootcamp Full Stack",
    modality: "presencial",
    status: "published",
    studentsCount: 32,
    nextSession: "29 de noviembre, 5:30 PM",
    category: "Programación",
  },
];

const mockSessions: UpcomingSession[] = [
  {
    id: "s1",
    courseTitle: "Introducción a JavaScript",
    dateTime: "25 de noviembre · 7:00 PM",
    modality: "virtual",
  },
  {
    id: "s2",
    courseTitle: "Marketing digital para productos",
    dateTime: "27 de noviembre · 6:00 PM",
    modality: "virtual",
  },
  {
    id: "s3",
    courseTitle: "Bootcamp Full Stack",
    dateTime: "29 de noviembre · 5:30 PM",
    modality: "presencial",
    city: "Ciudad de México",
  },
];

const stats = [
  { title: "Cursos activos", value: 3, description: "Con estudiantes en línea" },
  { title: "Cursos en borrador", value: 1, description: "Listos para publicar" },
  { title: "Total de estudiantes", value: 102, description: "Matriculados en tus cursos" },
  { title: "Próximas sesiones", value: 3, description: "Clases agendadas esta semana" },
];

export default function InstructorDashboardPage() {
  const [activeTab, setActiveTab] = useState<CourseFilterTab>("all");
  const [mounted, setMounted] = useState(false);

  // Evitar error de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4">
        <InstructorDashboardHeader />
        <InstructorStatsCards stats={stats} />
        <Card className="border border-border bg-card/90">
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-lg font-semibold text-foreground mb-1" style={{ listStyle: "none" }}>Tus cursos</h3>
            <p className="text-sm text-muted-foreground" style={{ listStyle: "none" }}>Administra tus contenidos</p>
          </div>
          <CardContent className="px-6 pb-6 pt-0">
            {mounted ? (
              <Tabs 
                value={activeTab} 
                onValueChange={(value) => setActiveTab(value as CourseFilterTab)} 
                defaultValue="all"
              >
              <TabsList className="mb-4">
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="published">Activos</TabsTrigger>
                <TabsTrigger value="draft">Borrador</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-0">
                <CourseList courses={mockCourses} activeTab="all" />
              </TabsContent>
              <TabsContent value="published" className="mt-0">
                <CourseList courses={mockCourses} activeTab="published" />
              </TabsContent>
              <TabsContent value="draft" className="mt-0">
                <CourseList courses={mockCourses} activeTab="draft" />
              </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex gap-2 mb-4">
                  <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
                  <div className="h-9 w-20 rounded-md bg-muted animate-pulse" />
                  <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <UpcomingSessionsCard sessions={mockSessions} />
      </div>
    </div>
  );
}

