"use client";

import { useState, useMemo } from "react";
import { MyCoursesHeader } from "@/components/student/my-courses-header";
import { MyCoursesFilters } from "@/components/student/my-courses-filters";
import { MyCoursesList } from "@/components/student/my-courses-list";
import { MyCoursesStats } from "@/components/student/my-courses-stats";
import { StudentCourse } from "@/components/student/types";

const mockStudentCourses: StudentCourse[] = [
  {
    id: "1",
    title: "Introducción a JavaScript",
    modality: "virtual",
    progress: 45,
    nextSession: "25 de noviembre · 7:00 PM",
    instructorName: "Ana López",
    category: "Programación",
    status: "in-progress",
    purchaseDate: "15 de octubre, 2024",
    startDate: "20 de octubre, 2024",
    totalSessions: 12,
    completedSessions: 5,
    imageUrl: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    title: "Productividad con IA",
    modality: "virtual",
    progress: 60,
    nextSession: "27 de noviembre · 6:00 PM",
    instructorName: "Bruno Martínez",
    category: "Negocios",
    status: "in-progress",
    purchaseDate: "10 de octubre, 2024",
    startDate: "15 de octubre, 2024",
    totalSessions: 8,
    completedSessions: 5,
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    title: "Diseño UX práctico",
    modality: "presencial",
    progress: 22,
    nextSession: "29 de noviembre · 5:30 PM",
    instructorName: "Natalia Soto",
    category: "Diseño",
    status: "in-progress",
    purchaseDate: "5 de noviembre, 2024",
    startDate: "10 de noviembre, 2024",
    totalSessions: 10,
    completedSessions: 2,
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d29294e0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    title: "Marketing de contenidos",
    modality: "virtual",
    progress: 100,
    instructorName: "Luis Herrera",
    category: "Marketing",
    status: "completed",
    purchaseDate: "1 de septiembre, 2024",
    startDate: "5 de septiembre, 2024",
    endDate: "30 de septiembre, 2024",
    totalSessions: 15,
    completedSessions: 15,
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "5",
    title: "React Avanzado",
    modality: "virtual",
    progress: 85,
    nextSession: "30 de noviembre · 8:00 PM",
    instructorName: "Carlos Méndez",
    category: "Programación",
    status: "in-progress",
    purchaseDate: "20 de octubre, 2024",
    startDate: "25 de octubre, 2024",
    totalSessions: 20,
    completedSessions: 17,
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "6",
    title: "Fotografía digital",
    modality: "presencial",
    progress: 100,
    instructorName: "María González",
    category: "Diseño",
    status: "completed",
    purchaseDate: "15 de agosto, 2024",
    startDate: "20 de agosto, 2024",
    endDate: "15 de septiembre, 2024",
    totalSessions: 8,
    completedSessions: 8,
    imageUrl: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "7",
    title: "Gestión de proyectos ágiles",
    modality: "virtual",
    progress: 30,
    nextSession: "1 de diciembre · 7:30 PM",
    instructorName: "Roberto Silva",
    category: "Negocios",
    status: "in-progress",
    purchaseDate: "1 de noviembre, 2024",
    startDate: "5 de noviembre, 2024",
    totalSessions: 12,
    completedSessions: 4,
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "8",
    title: "Copywriting persuasivo",
    modality: "virtual",
    progress: 100,
    instructorName: "Laura Fernández",
    category: "Marketing",
    status: "completed",
    purchaseDate: "1 de agosto, 2024",
    startDate: "5 de agosto, 2024",
    endDate: "25 de agosto, 2024",
    totalSessions: 10,
    completedSessions: 10,
    imageUrl: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
  },
];

export default function MyCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalityFilter, setModalityFilter] = useState<string>("all");

  const filteredCourses = useMemo(() => {
    return mockStudentCourses
      .filter((course) => {
        const searchLower = searchTerm.trim().toLowerCase();
        return (
          course.title.toLowerCase().includes(searchLower) ||
          course.instructorName.toLowerCase().includes(searchLower) ||
          course.category.toLowerCase().includes(searchLower)
        );
      })
      .filter((course) => {
        if (statusFilter === "all") return true;
        return course.status === statusFilter;
      })
      .filter((course) => {
        if (modalityFilter === "all") return true;
        return course.modality === modalityFilter;
      });
  }, [searchTerm, statusFilter, modalityFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setModalityFilter("all");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <MyCoursesHeader />
      <MyCoursesStats courses={mockStudentCourses} />
      <MyCoursesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        modalityFilter={modalityFilter}
        onModalityChange={setModalityFilter}
        onClear={handleClearFilters}
      />
      <MyCoursesList courses={filteredCourses} onClearFilters={handleClearFilters} />
    </div>
  );
}

