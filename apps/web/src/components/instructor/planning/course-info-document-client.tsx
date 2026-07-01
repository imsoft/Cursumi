"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { CourseInfoDocumentForm } from "./course-info-document-form";
import { CourseInfoDocumentDocument } from "./course-info-document-document";
import {
  type CourseInfoDocumentData,
  hydrateCourseInfoDocument,
  COURSE_INFO_TYPE,
} from "@/lib/planning/course-info-document";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function CourseInfoDocumentClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<CourseInfoDocumentData>
      courseId={courseId}
      type={COURSE_INFO_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateCourseInfoDocument(raw, prefill)}
      seedFromCourse={() => hydrateCourseInfoDocument(null, prefill)}
      renderForm={(value, onChange) => <CourseInfoDocumentForm value={value} onChange={onChange} />}
      renderDocument={(value) => <CourseInfoDocumentDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(COURSE_INFO_TYPE, value.courseName)}
    />
  );
}
