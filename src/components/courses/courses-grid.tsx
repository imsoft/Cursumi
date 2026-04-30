"use client";

import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import { Course } from "./types";
import { CourseCard } from "./course-card";
import { EmptyState } from "@/components/shared/empty-state";

interface CoursesGridProps {
  courses: Course[];
  hasFiltersApplied: boolean;
  onClearFilters: () => void;
}

export const CoursesGrid = ({
  courses,
  hasFiltersApplied,
  onClearFilters,
}: CoursesGridProps) => {
  if (!courses.length) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-8">
        <EmptyState
          icon={SearchX}
          title="Sin resultados para esa búsqueda"
          description={
            hasFiltersApplied
              ? "Intenta con otros filtros o limpia la búsqueda para ver todos los cursos disponibles."
              : "Todavía no hay cursos publicados. Vuelve pronto."
          }
          action={hasFiltersApplied ? { label: "Ver todos los cursos", variant: "outline", onClick: onClearFilters } : undefined}
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course, index) => (
          <CourseCard key={course.id} course={course} priority={index === 0} />
        ))}
      </div>
    </section>
  );
};
