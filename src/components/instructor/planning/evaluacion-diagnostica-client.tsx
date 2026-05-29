"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { EvaluacionDiagnosticaForm } from "./evaluacion-diagnostica-form";
import { EvaluacionDiagnosticaDocument } from "./evaluacion-diagnostica-document";
import {
  type EvaluacionDiagnosticaData,
  hydrateEvaluacionDiagnostica,
  EVALUACION_DIAGNOSTICA_TYPE,
} from "@/lib/planning/evaluacion-diagnostica";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string };
};

export function EvaluacionDiagnosticaClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<EvaluacionDiagnosticaData>
      courseId={courseId}
      type={EVALUACION_DIAGNOSTICA_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateEvaluacionDiagnostica(raw, prefill)}
      renderForm={(value, onChange) => <EvaluacionDiagnosticaForm value={value} onChange={onChange} />}
      renderDocument={(value) => <EvaluacionDiagnosticaDocument data={value} />}
      pdfFilename={(value) => `Evaluacion-diagnostica-${sanitizeFilename(value.nombreCurso || "curso")}.pdf`}
    />
  );
}
