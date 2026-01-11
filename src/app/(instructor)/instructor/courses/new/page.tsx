"use client";

import { CreateCourseWizard } from "@/components/instructor/create-course-wizard";

export default function InstructorCreateCoursePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <CreateCourseWizard />
    </div>
  );
}
