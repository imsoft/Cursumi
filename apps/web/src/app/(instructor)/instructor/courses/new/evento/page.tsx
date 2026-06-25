"use client";

import { CreateCourseWizard } from "@/components/instructor/create-course-wizard";

export default function CreateEventoCoursePage() {
  return (
    <div className="space-y-6">
      <CreateCourseWizard modality="evento" />
    </div>
  );
}
