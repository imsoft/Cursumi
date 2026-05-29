"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ManualParticipanteForm } from "./manual-participante-form";
import { ManualParticipanteDocument } from "./manual-participante-document";
import {
  type ManualParticipanteData,
  hydrateManualParticipante,
  MANUAL_PARTICIPANTE_TYPE,
} from "@/lib/planning/manual-participante";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string };
};

export function ManualParticipanteClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ManualParticipanteData>
      courseId={courseId}
      type={MANUAL_PARTICIPANTE_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateManualParticipante(raw, prefill)}
      renderForm={(value, onChange) => <ManualParticipanteForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ManualParticipanteDocument data={value} />}
      pdfFilename={(value) => `Manual-del-participante-${sanitizeFilename(value.nombreCurso || "curso")}.pdf`}
    />
  );
}
