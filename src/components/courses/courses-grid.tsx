import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import { Course } from "./types";
import { CourseCard } from "./course-card";

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
        <div className="flex flex-col items-center gap-5 rounded-3xl border border-dashed border-border bg-card/60 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <SearchX className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div>
            <p className="text-lg font-bold text-foreground">
              Sin resultados para esa búsqueda
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {hasFiltersApplied
                ? "Intenta con otros filtros o limpia la búsqueda para ver todos los cursos disponibles."
                : "Todavía no hay cursos publicados. Vuelve pronto."}
            </p>
          </div>
          {hasFiltersApplied && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              Ver todos los cursos
            </Button>
          )}
        </div>
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
