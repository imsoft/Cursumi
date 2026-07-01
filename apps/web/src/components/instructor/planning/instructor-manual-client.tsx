"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ParticipantManualForm } from "./participant-manual-form";
import { ParticipantManualDocument } from "./participant-manual-document";
import {
  type InstructorManualData,
  hydrateInstructorManual,
  MANUAL_INSTRUCTOR_TYPE,
} from "@/lib/planning/instructor-manual";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function InstructorManualClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<InstructorManualData>
      courseId={courseId}
      type={MANUAL_INSTRUCTOR_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateInstructorManual(raw, prefill)}
      seedFromCourse={() => hydrateInstructorManual(null, prefill)}
      renderForm={(value, onChange) => <ParticipantManualForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ParticipantManualDocument data={value} documentTitle="Manual del instructor" />}
      pdfFilename={(value) => buildPlanningFilename(MANUAL_INSTRUCTOR_TYPE, value.courseName)}
    />
  );
}
