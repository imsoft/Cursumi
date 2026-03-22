"use client";

import { CreateCourseWizard } from "@/components/instructor/create-course-wizard";

export default function CreateVirtualCoursePage() {
  return (
    <div className="space-y-6">
      <CreateCourseWizard modality="virtual" />
    </div>
  );
}
