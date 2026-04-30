"use client";

import { useMemo } from "react";
import { BookOpen } from "lucide-react";
import { CourseListItem } from "@/components/instructor/course-list-item";
import { InstructorCourse } from "@/components/instructor/types";
import { EmptyState } from "@/components/shared/empty-state";

export type CourseFilterTab = "all" | "published" | "draft";

interface CourseListProps {
  courses: InstructorCourse[];
  activeTab?: CourseFilterTab;
}

export const CourseList = ({ courses, activeTab = "all" }: CourseListProps) => {
  const filteredCourses = useMemo(() => {
    if (activeTab === "all") {
      return courses;
    }
    return courses.filter((course) =>
      activeTab === "published" ? course.status === "published" : course.status === "draft",
    );
  }, [activeTab, courses]);

  if (filteredCourses.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        title="No hay cursos en esta categoría"
        description="Prueba seleccionando otro filtro o crea un nuevo curso"
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredCourses.map((course) => (
        <CourseListItem key={course.id} course={course} />
      ))}
    </div>
  );
};

