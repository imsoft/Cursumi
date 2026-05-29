"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { CourseInfoDocumentForm } from "./course-info-document-form";
import { CourseInfoDocumentDocument } from "./course-info-document-document";
import {
  type CourseInfoDocumentData,
  hydrateCourseInfoDocument,
  COURSE_INFO_TYPE,
} from "@/lib/planning/course-info-document";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string; instructorName?: string };
};

export function CourseInfoDocumentClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<CourseInfoDocumentData>
      courseId={courseId}
      type={COURSE_INFO_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateCourseInfoDocument(raw, prefill)}
      renderForm={(value, onChange) => <CourseInfoDocumentForm value={value} onChange={onChange} />}
      renderDocument={(value) => <CourseInfoDocumentDocument data={value} />}
      pdfFilename={(value) => `Informacion-general-${sanitizeFilename(value.courseName || "curso")}.pdf`}
    />
  );
}
