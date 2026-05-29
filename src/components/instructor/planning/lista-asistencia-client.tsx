"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ListaAsistenciaForm } from "./lista-asistencia-form";
import { ListaAsistenciaDocument } from "./lista-asistencia-document";
import {
  type ListaAsistenciaData,
  hydrateListaAsistencia,
  LISTA_ASISTENCIA_TYPE,
} from "@/lib/planning/lista-asistencia";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string };
};

export function ListaAsistenciaClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ListaAsistenciaData>
      courseId={courseId}
      type={LISTA_ASISTENCIA_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateListaAsistencia(raw, prefill)}
      renderForm={(value, onChange) => <ListaAsistenciaForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ListaAsistenciaDocument data={value} />}
      pdfFilename={(value) => `Lista-asistencia-${sanitizeFilename(value.nombreCurso || "curso")}.pdf`}
    />
  );
}
