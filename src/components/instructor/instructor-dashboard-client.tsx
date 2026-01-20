"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InstructorDashboardHeader } from "@/components/instructor/instructor-dashboard-header";
import { InstructorStatsCards } from "@/components/instructor/instructor-stats-cards";
import { CourseList, CourseFilterTab } from "@/components/instructor/course-list";
import { UpcomingSessionsCard } from "@/components/instructor/upcoming-sessions-card";
import type { InstructorCourse, UpcomingSession } from "@/components/instructor/types";

interface InstructorDashboardClientProps {
  name: string;
  courses: InstructorCourse[];
}

export function InstructorDashboardClient({ name, courses }: InstructorDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<CourseFilterTab>("all");

  const stats = useMemo(() => {
    const published = courses.filter((c) => c.status === "published").length;
    const draft = courses.filter((c) => c.status === "draft").length;
    const totalStudents = courses.reduce((sum, c) => sum + c.studentsCount, 0);
    return [
      { title: "Cursos activos", value: published, description: "Publicados" },
      { title: "Cursos en borrador", value: draft, description: "Listos para publicar" },
      { title: "Total de estudiantes", value: totalStudents, description: "Inscritos en tus cursos" },
      { title: "Próximas sesiones", value: upcomingSessions(courses).length, description: "Agendadas" },
    ];
  }, [courses]);

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-6xl space-y-6 px-4">
        <InstructorDashboardHeader name={name} />
        <InstructorStatsCards stats={stats} />
        <Card className="border border-border bg-card/90">
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-lg font-semibold text-foreground mb-1">Tus cursos</h3>
            <p className="text-sm text-muted-foreground">Administra tus contenidos</p>
          </div>
          <CardContent className="px-6 pb-6 pt-0">
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
                <CourseList courses={courses} activeTab="all" />
              </TabsContent>
              <TabsContent value="published" className="mt-0">
                <CourseList courses={courses} activeTab="published" />
              </TabsContent>
              <TabsContent value="draft" className="mt-0">
                <CourseList courses={courses} activeTab="draft" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <UpcomingSessionsCard sessions={upcomingSessions(courses)} />
      </div>
    </div>
  );
}

function upcomingSessions(courses: InstructorCourse[]): UpcomingSession[] {
  return courses
    .filter((course) => course.nextSession)
    .slice(0, 3)
    .map((course) => ({
      id: `up-${course.id}`,
      courseTitle: course.title,
      dateTime: course.nextSession || "",
      modality: course.modality,
    }));
}
