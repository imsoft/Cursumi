"use client";

import { StudentCourse } from "@/components/student/types";
import { StatsGrid, StatItem } from "@/components/shared/stats-card";
import { BookOpenCheck, CheckCircle2, Clock, TrendingUp } from "lucide-react";

interface MyCoursesStatsProps {
  courses: StudentCourse[];
}

export const MyCoursesStats = ({ courses }: MyCoursesStatsProps) => {
  const totalCourses = courses.length;
  const completedCourses = courses.filter((c) => c.status === "completed").length;
  const inProgressCourses = courses.filter((c) => c.status === "in-progress").length;
  const averageProgress =
    courses.length > 0
      ? Math.round(
          courses.reduce((acc, course) => acc + course.progress, 0) / courses.length
        )
      : 0;

  const stats: StatItem[] = [
    {
      title: "Total de cursos",
      value: totalCourses.toString(),
      description: "Cursos comprados",
      icon: BookOpenCheck,
      iconColor: "text-blue-600",
    },
    {
      title: "En progreso",
      value: inProgressCourses.toString(),
      description: "Cursos activos",
      icon: Clock,
      iconColor: "text-orange-600",
    },
    {
      title: "Completados",
      value: completedCourses.toString(),
      description: "Cursos finalizados",
      icon: CheckCircle2,
      iconColor: "text-green-600",
    },
    {
      title: "Progreso promedio",
      value: `${averageProgress}%`,
      description: "Avance general",
      icon: TrendingUp,
      iconColor: "text-purple-600",
    },
  ];

  return <StatsGrid stats={stats} columns={4} />;
};

