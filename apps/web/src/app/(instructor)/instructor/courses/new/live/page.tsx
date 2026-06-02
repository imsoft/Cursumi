"use client";

import { CreateCourseWizard } from "@/components/instructor/create-course-wizard";

export default function CreateLiveCoursePage() {
  return (
    <div className="space-y-6">
      <CreateCourseWizard modality="live" />
    </div>
  );
}
