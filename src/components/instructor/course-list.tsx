import { useMemo } from "react";
import { CourseListItem } from "@/components/instructor/course-list-item";
import { InstructorCourse } from "@/components/instructor/types";

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
      <div className="py-8 text-center text-muted-foreground">
        <p>No hay cursos en esta categoría.</p>
      </div>
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

