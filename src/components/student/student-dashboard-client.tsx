"use client";

import Link from "next/link";
import { StudentDashboardHeader } from "@/components/student/student-dashboard-header";
import { StudentStatsCards } from "@/components/student/student-stats-cards";
import { StudentCoursesInProgress } from "@/components/student/student-courses-in-progress";
import { StudentUpcomingClasses } from "@/components/student/student-upcoming-classes";
import { StudentRecommendedCourses } from "@/components/student/student-recommended-courses";
import type { StudentCourse, Recommendation, UpcomingClass } from "@/components/student/types";
import { ProfileCompleteness, type ProfileField } from "@/components/student/profile-completeness";
import { PlayCircle } from "lucide-react";

interface StudentDashboardClientProps {
  name: string;
  courses: StudentCourse[];
  recommendations: Recommendation[];
  hoursWatched?: string;
  orgName?: string | null;
  profileFields?: ProfileField[];
}

export function StudentDashboardClient({
  name,
  courses,
  recommendations,
  hoursWatched = "0h",
  orgName,
  profileFields,
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
      {profileFields && <ProfileCompleteness fields={profileFields} />}
      <ContinueWatching courses={courses} />
      <StudentCoursesInProgress courses={courses} />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr] lg:items-stretch">
        <StudentUpcomingClasses classes={upcoming} />
        <StudentRecommendedCourses recommendations={recommendations} />
      </div>
    </div>
  );
}

function ContinueWatching({ courses }: { courses: StudentCourse[] }) {
  // Cursos en progreso que tienen una lección guardada
  const inProgress = courses.filter(
    (c) => c.status !== "completed" && c.lastLessonId
  );
  if (inProgress.length === 0) return null;

  // Mostrar solo el más reciente (el primero de la lista ya viene ordenado por createdAt desc)
  const course = inProgress[0];

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
        Continúa donde lo dejaste
      </p>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-semibold text-foreground truncate">{course.title}</p>
          {course.lastLessonTitle && (
            <p className="text-sm text-muted-foreground truncate mt-0.5">
              Última lección: {course.lastLessonTitle}
            </p>
          )}
        </div>
        <Link
          href={`/dashboard/my-courses/${course.id}/lessons/${course.lastLessonId}`}
          className="shrink-0"
        >
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            <PlayCircle className="h-4 w-4" />
            Continuar
          </span>
        </Link>
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
