"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CoursesFilters } from "@/components/instructor/courses-filters";
import { CourseList } from "@/components/instructor/course-list";
import { EmptyState } from "@/components/instructor/empty-state";
import { InstructorCourse } from "@/components/instructor/types";

const mockCourses: InstructorCourse[] = [
  {
    id: "1",
    title: "Introducción a JavaScript",
    modality: "virtual",
    status: "published",
    studentsCount: 28,
    nextSession: "25 de noviembre · 7:00 PM",
    category: "Programación",
  },
  {
    id: "2",
    title: "Copywriting efectivo",
    modality: "virtual",
    status: "draft",
    studentsCount: 12,
    category: "Marketing",
  },
  {
    id: "3",
    title: "UX Research aplicado",
    modality: "presencial",
    status: "published",
    studentsCount: 34,
    nextSession: "26 de noviembre · 6:00 PM",
    category: "Diseño",
  },
  {
    id: "4",
    title: "Planeación financiera para startups",
    modality: "presencial",
    status: "archived",
    studentsCount: 16,
    category: "Negocios",
  },
  {
    id: "5",
    title: "Habilidades blandas para equipos remotos",
    modality: "virtual",
    status: "published",
    studentsCount: 64,
    nextSession: "28 de noviembre · 8:00 PM",
    category: "Habilidades blandas",
  },
  {
    id: "6",
    title: "Automatización con Python",
    modality: "virtual",
    status: "draft",
    studentsCount: 21,
    category: "Programación",
  },
];

export default function InstructorCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InstructorCourse["status"] | "all">("all");
  const [modalityFilter, setModalityFilter] = useState<InstructorCourse["modality"] | "all">("all");

  const filteredCourses = useMemo(() => {
    return mockCourses
      .filter((course) =>
        course.title.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      )
      .filter((course) => (statusFilter === "all" ? true : course.status === statusFilter))
      .filter((course) => (modalityFilter === "all" ? true : course.modality === modalityFilter));
  }, [searchTerm, statusFilter, modalityFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setModalityFilter("all");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/90 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Mis cursos</h1>
          <p className="text-sm text-muted-foreground">
            Administra los cursos que impartes en Cursumi.
          </p>
        </div>
        <Button size="lg" asChild>
          <Link href="/instructor/courses/new">Crear nuevo curso</Link>
        </Button>
      </div>
      <Card className="border border-border bg-card/90">
        <CardContent className="space-y-4 px-6 pb-6 pt-4">
          <CoursesFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={(value) => setStatusFilter(value as InstructorCourse["status"] | "all")}
            modalityFilter={modalityFilter}
            onModalityChange={(value) =>
              setModalityFilter(value as InstructorCourse["modality"] | "all")
            }
            onClear={handleClearFilters}
          />
        </CardContent>
      </Card>
      {filteredCourses.length === 0 ? (
        <EmptyState onResetFilters={handleClearFilters} />
      ) : (
        <CourseList courses={filteredCourses} />
      )}
      <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>Mostrando {filteredCourses.length} de {mockCourses.length} cursos</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Anterior</Button>
          <Button variant="outline" size="sm">Siguiente</Button>
        </div>
      </div>
    </div>
  );
}

