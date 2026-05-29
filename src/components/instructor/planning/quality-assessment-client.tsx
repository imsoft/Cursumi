"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { QualityAssessmentForm } from "./quality-assessment-form";
import { QualityAssessmentDocument } from "./quality-assessment-document";
import {
  type QualityAssessmentData,
  hydrateQualityAssessment,
  QUALITY_ASSESSMENT_TYPE,
} from "@/lib/planning/quality-assessment";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string; instructorName?: string; duration?: string };
};

export function QualityAssessmentClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<QualityAssessmentData>
      courseId={courseId}
      type={QUALITY_ASSESSMENT_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateQualityAssessment(raw, prefill)}
      renderForm={(value, onChange) => <QualityAssessmentForm value={value} onChange={onChange} />}
      renderDocument={(value) => <QualityAssessmentDocument data={value} />}
      pdfFilename={(value) => `Evaluacion-de-calidad-${sanitizeFilename(value.courseName || "curso")}.pdf`}
    />
  );
}
