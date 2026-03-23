"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CoursesFilters } from "@/components/instructor/courses-filters";
import { CourseList } from "@/components/instructor/course-list";
import { EmptyState } from "@/components/instructor/empty-state";
import type { InstructorCourse } from "@/components/instructor/types";

interface InstructorCoursesClientProps {
  initialCourses: InstructorCourse[];
}

export function InstructorCoursesClient({ initialCourses }: InstructorCoursesClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<InstructorCourse["status"] | "all">("all");
  const [modalityFilter, setModalityFilter] = useState<InstructorCourse["modality"] | "all">("all");

  const filteredCourses = useMemo(() => {
    return initialCourses
      .filter((course) =>
        course.title.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      )
      .filter((course) => (statusFilter === "all" ? true : course.status === statusFilter))
      .filter((course) => (modalityFilter === "all" ? true : course.modality === modalityFilter));
  }, [initialCourses, searchTerm, statusFilter, modalityFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setModalityFilter("all");
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card/90 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Mis cursos</h1>
          <p className="text-sm text-muted-foreground">
            Crea y administra los cursos que impartes.
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
        <p>Mostrando {filteredCourses.length} de {initialCourses.length} cursos</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
}
