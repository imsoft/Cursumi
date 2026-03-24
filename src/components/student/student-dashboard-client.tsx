"use client";

import { StudentDashboardHeader } from "@/components/student/student-dashboard-header";
import { StudentStatsCards } from "@/components/student/student-stats-cards";
import { StudentCoursesInProgress } from "@/components/student/student-courses-in-progress";
import { StudentUpcomingClasses } from "@/components/student/student-upcoming-classes";
import { StudentRecommendedCourses } from "@/components/student/student-recommended-courses";
import type { StudentCourse, Recommendation, UpcomingClass } from "@/components/student/types";

interface StudentDashboardClientProps {
  name: string;
  courses: StudentCourse[];
  recommendations: Recommendation[];
  hoursWatched?: string;
  orgName?: string | null;
}

export function StudentDashboardClient({
  name,
  courses,
  recommendations,
  hoursWatched = "0h",
  orgName,
}: StudentDashboardClientProps) {
  const stats = [
    { title: "Cursos activos", value: courses.length, subtitle: "Actualmente en progreso" },
    {
      title: "Cursos completados",
      value: courses.filter((c) => c.status === "completed").length,
      subtitle: "Total finalizados",
    },
    {
      title: "Horas aprendidas",
      value: hoursWatched,
      subtitle: "De lecciones completadas",
    },
    {
      title: "Próxima clase",
      value: upcomingFromCourses(courses)?.[0]?.dateTime || "—",
      subtitle: "Sesión más cercana",
    },
  ];

  const upcoming = upcomingFromCourses(courses);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <StudentDashboardHeader name={name} />
      {orgName && (
        <div className="rounded-lg border bg-primary/5 px-4 py-3 text-sm">
          <span className="font-medium">{orgName}</span>{" "}
          <span className="text-muted-foreground">— Acceso empresarial</span>
        </div>
      )}
      <StudentStatsCards stats={stats} />
      <StudentCoursesInProgress courses={courses} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr] lg:items-stretch">
        <StudentUpcomingClasses classes={upcoming} />
        <StudentRecommendedCourses recommendations={recommendations} />
      </div>
    </div>
  );
}

function upcomingFromCourses(courses: StudentCourse[]): UpcomingClass[] {
  return courses
    .filter((course) => course.nextSession)
    .slice(0, 3)
    .map((course) => ({
      id: `up-${course.id}`,
      courseId: course.id,
      courseTitle: course.title,
      dateTime: course.nextSession || "",
      modality: course.modality,
      instructorName: course.instructorName,
      imageUrl:
        course.imageUrl ||
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
    }));
}
