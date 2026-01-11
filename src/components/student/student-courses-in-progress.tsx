"use client";

import { StudentCourse } from "@/components/student/types";
import { StudentCourseCard } from "@/components/student/student-course-card";

interface StudentCoursesInProgressProps {
  courses: StudentCourse[];
}

export const StudentCoursesInProgress = ({ courses }: StudentCoursesInProgressProps) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-foreground">Tus cursos en progreso</h2>
        <p className="text-sm text-muted-foreground">Retoma donde te quedaste.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <StudentCourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
};

