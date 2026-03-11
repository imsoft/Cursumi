import { Button } from "@/components/ui/button";
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
      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-muted-foreground">
            No encontramos cursos con esos filtros.
          </p>
          <p className="max-w-lg text-sm text-muted-foreground">
            Ajusta tu búsqueda para ver más resultados o limpia los filtros para
            volver a ver todos los cursos disponibles.
          </p>
          <Button variant="outline" size="sm" onClick={onClearFilters}>
            Ver todos los cursos
          </Button>
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
      {hasFiltersApplied && (
        <div className="mt-8 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.4em] text-muted-foreground">
          <span>Filtros activos</span>
        </div>
      )}
    </section>
  );
};

