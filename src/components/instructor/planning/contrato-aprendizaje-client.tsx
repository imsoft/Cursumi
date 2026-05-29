"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ContratoAprendizajeForm } from "./contrato-aprendizaje-form";
import { ContratoAprendizajeDocument } from "./contrato-aprendizaje-document";
import {
  type ContratoAprendizajeData,
  hydrateContratoAprendizaje,
  CONTRATO_APRENDIZAJE_TYPE,
} from "@/lib/planning/contrato-aprendizaje";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string };
};

export function ContratoAprendizajeClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ContratoAprendizajeData>
      courseId={courseId}
      type={CONTRATO_APRENDIZAJE_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateContratoAprendizaje(raw, prefill)}
      renderForm={(value, onChange) => <ContratoAprendizajeForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ContratoAprendizajeDocument data={value} />}
      pdfFilename={(value) => `Contrato-aprendizaje-${sanitizeFilename(value.nombreCurso || "curso")}.pdf`}
    />
  );
}
