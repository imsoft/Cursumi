"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { EvaluacionCalidadForm } from "./evaluacion-calidad-form";
import { EvaluacionCalidadDocument } from "./evaluacion-calidad-document";
import {
  type EvaluacionCalidadData,
  hydrateEvaluacionCalidad,
  EVALUACION_CALIDAD_TYPE,
} from "@/lib/planning/evaluacion-calidad";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string };
};

export function EvaluacionCalidadClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<EvaluacionCalidadData>
      courseId={courseId}
      type={EVALUACION_CALIDAD_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateEvaluacionCalidad(raw, prefill)}
      renderForm={(value, onChange) => <EvaluacionCalidadForm value={value} onChange={onChange} />}
      renderDocument={(value) => <EvaluacionCalidadDocument data={value} />}
      pdfFilename={(value) => `Evaluacion-de-calidad-${sanitizeFilename(value.nombreCurso || "curso")}.pdf`}
    />
  );
}
