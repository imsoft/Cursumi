"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { QualityAssessmentForm } from "./quality-assessment-form";
import { QualityAssessmentDocument } from "./quality-assessment-document";
import {
  type QualityAssessmentData,
  hydrateQualityAssessment,
  QUALITY_ASSESSMENT_TYPE,
} from "@/lib/planning/quality-assessment";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function QualityAssessmentClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<QualityAssessmentData>
      courseId={courseId}
      type={QUALITY_ASSESSMENT_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateQualityAssessment(raw, prefill)}
      seedFromCourse={() => hydrateQualityAssessment(null, prefill)}
      renderForm={(value, onChange) => <QualityAssessmentForm value={value} onChange={onChange} />}
      renderDocument={(value) => <QualityAssessmentDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(QUALITY_ASSESSMENT_TYPE, value.courseName)}
    />
  );
}
