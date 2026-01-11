"use client";

import { StudentDashboardHeader } from "@/components/student/student-dashboard-header";
import { StudentStatsCards } from "@/components/student/student-stats-cards";
import { StudentCoursesInProgress } from "@/components/student/student-courses-in-progress";
import { StudentUpcomingClasses } from "@/components/student/student-upcoming-classes";
import { StudentRecommendedCourses } from "@/components/student/student-recommended-courses";
import { StudentCourse, UpcomingClass, Recommendation } from "@/components/student/types";

const studentStats = [
  { title: "Cursos activos", value: 3, subtitle: "Actualmente en progreso" },
  { title: "Cursos completados", value: 5, subtitle: "En los últimos 6 meses" },
  { title: "Horas vistas", value: "42h", subtitle: "Contenido consumido" },
  { title: "Próxima clase", value: "26 Nov", subtitle: "Sesión más cercana" },
];

const mockStudentCourses: StudentCourse[] = [
  {
    id: "1",
    title: "Introducción a JavaScript",
    modality: "virtual",
    progress: 45,
    nextSession: "25 de noviembre · 7:00 PM",
    instructorName: "Ana López",
    category: "Programación",
    imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop",
  },
  {
    id: "2",
    title: "Productividad con IA",
    modality: "virtual",
    progress: 60,
    nextSession: "27 de noviembre · 6:00 PM",
    instructorName: "Bruno Martínez",
    category: "Negocios",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
  },
  {
    id: "3",
    title: "Diseño UX práctico",
    modality: "presencial",
    progress: 22,
    nextSession: "29 de noviembre · 5:30 PM",
    instructorName: "Natalia Soto",
    category: "Diseño",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
  },
  {
    id: "4",
    title: "Marketing de contenidos",
    modality: "virtual",
    progress: 82,
    nextSession: "1 de diciembre · 8:00 PM",
    instructorName: "Luis Herrera",
    category: "Marketing",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=450&fit=crop",
  },
];

const mockUpcomingClasses: UpcomingClass[] = [
  {
    id: "uc1",
    courseTitle: "Diseño UX práctico",
    dateTime: "29 de noviembre · 5:30 PM",
    modality: "presencial",
    instructorName: "Natalia Soto",
    city: "Guadalajara",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
  },
  {
    id: "uc2",
    courseTitle: "Productividad con IA",
    dateTime: "27 de noviembre · 6:00 PM",
    modality: "virtual",
    instructorName: "Bruno Martínez",
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
  },
  {
    id: "uc3",
    courseTitle: "Introducción a JavaScript",
    dateTime: "25 de noviembre · 7:00 PM",
    modality: "virtual",
    instructorName: "Ana López",
    imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=450&fit=crop",
  },
];

const mockRecommendations: Recommendation[] = [
  {
    id: "r1",
    title: "Bootcamp Full Stack",
    category: "Programación",
    modality: "virtual",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=450&fit=crop",
  },
  {
    id: "r2",
    title: "Habilidades blandas para equipos remotos",
    category: "Habilidades blandas",
    modality: "virtual",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=450&fit=crop",
  },
  {
    id: "r3",
    title: "Presentaciones efectivas",
    category: "Marketing",
    modality: "presencial",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=450&fit=crop",
  },
];

export default function StudentDashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <StudentDashboardHeader name="Brandon" />
      <StudentStatsCards stats={studentStats} />
      <StudentCoursesInProgress courses={mockStudentCourses} />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-stretch">
        <StudentUpcomingClasses classes={mockUpcomingClasses} />
        <StudentRecommendedCourses recommendations={mockRecommendations} />
      </div>
    </div>
  );
}

