"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { VirtualParticipantManualForm } from "./virtual-participant-manual-form";
import { VirtualParticipantManualDocument } from "./virtual-participant-manual-document";
import {
  type VirtualParticipantManualData,
  hydrateVirtualParticipantManual,
  VIRTUAL_PARTICIPANT_MANUAL_TYPE,
} from "@/lib/planning/virtual-participant-manual";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string };
};

export function VirtualParticipantManualClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<VirtualParticipantManualData>
      courseId={courseId}
      type={VIRTUAL_PARTICIPANT_MANUAL_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateVirtualParticipantManual(raw, prefill)}
      renderForm={(value, onChange) => <VirtualParticipantManualForm value={value} onChange={onChange} />}
      renderDocument={(value) => <VirtualParticipantManualDocument data={value} />}
      pdfFilename={(value) => `Manual-participante-${sanitizeFilename(value.courseName || "curso")}.pdf`}
    />
  );
}
