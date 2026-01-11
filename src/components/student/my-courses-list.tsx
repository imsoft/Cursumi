"use client";

import { StudentCourse } from "@/components/student/types";
import { StudentCourseCard } from "@/components/student/student-course-card";
import { EmptyState } from "@/components/shared/empty-state";

interface MyCoursesListProps {
  courses: StudentCourse[];
  onClearFilters: () => void;
}

export const MyCoursesList = ({ courses, onClearFilters }: MyCoursesListProps) => {
  if (courses.length === 0) {
    return (
      <EmptyState
        title="No encontramos cursos con estos filtros"
        description="Prueba ajustando tu búsqueda o explora nuevos cursos."
        action={{
          label: "Explorar cursos",
          href: "/courses",
          variant: "default",
        }}
        secondaryAction={{
          label: "Limpiar filtros",
          onClick: onClearFilters,
          variant: "outline",
        }}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {courses.length} {courses.length === 1 ? "curso" : "cursos"}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 md:items-stretch">
        {courses.map((course) => (
          <StudentCourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

