"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { CourseReviewReportForm } from "./course-review-report-form";
import { CourseReviewReportDocument } from "./course-review-report-document";
import {
  type CourseReviewReportData,
  hydrateCourseReviewReport,
  COURSE_REVIEW_REPORT_TYPE,
} from "@/lib/planning/course-review-report";
import { buildPlanningFilename } from "@/lib/planning/registry";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string; developerName?: string };
};

export function CourseReviewReportClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<CourseReviewReportData>
      courseId={courseId}
      type={COURSE_REVIEW_REPORT_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateCourseReviewReport(raw, prefill)}
      seedFromCourse={() => hydrateCourseReviewReport(null, prefill)}
      renderForm={(value, onChange) => <CourseReviewReportForm value={value} onChange={onChange} />}
      renderDocument={(value) => <CourseReviewReportDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(COURSE_REVIEW_REPORT_TYPE, value.courseName)}
    />
  );
}
