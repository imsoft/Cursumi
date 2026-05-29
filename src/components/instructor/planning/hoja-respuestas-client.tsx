"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { HojaRespuestasForm } from "./hoja-respuestas-form";
import { HojaRespuestasDocument } from "./hoja-respuestas-document";
import {
  type HojaRespuestasData,
  hydrateHojaRespuestas,
  HOJA_RESPUESTAS_TYPE,
} from "@/lib/planning/hoja-respuestas";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string };
};

export function HojaRespuestasClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<HojaRespuestasData>
      courseId={courseId}
      type={HOJA_RESPUESTAS_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateHojaRespuestas(raw, prefill)}
      renderForm={(value, onChange) => <HojaRespuestasForm value={value} onChange={onChange} />}
      renderDocument={(value) => <HojaRespuestasDocument data={value} />}
      pdfFilename={(value) => `Hoja-de-respuestas-${sanitizeFilename(value.nombreCurso || "curso")}.pdf`}
    />
  );
}
