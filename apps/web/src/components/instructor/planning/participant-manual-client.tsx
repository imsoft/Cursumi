"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ParticipantManualForm } from "./participant-manual-form";
import { ParticipantManualDocument } from "./participant-manual-document";
import {
  type ParticipantManualData,
  hydrateParticipantManual,
  PARTICIPANT_MANUAL_TYPE,
} from "@/lib/planning/participant-manual";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function ParticipantManualClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ParticipantManualData>
      courseId={courseId}
      type={PARTICIPANT_MANUAL_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateParticipantManual(raw, prefill)}
      seedFromCourse={() => hydrateParticipantManual(null, prefill)}
      renderForm={(value, onChange) => <ParticipantManualForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ParticipantManualDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(PARTICIPANT_MANUAL_TYPE, value.courseName)}
    />
  );
}
