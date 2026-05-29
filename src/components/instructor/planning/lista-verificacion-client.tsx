"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ListaVerificacionForm } from "./lista-verificacion-form";
import { ListaVerificacionDocument } from "./lista-verificacion-document";
import {
  type ListaVerificacionData,
  hydrateListaVerificacion,
  LISTA_VERIFICACION_TYPE,
} from "@/lib/planning/lista-verificacion";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string };
};

export function ListaVerificacionClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ListaVerificacionData>
      courseId={courseId}
      type={LISTA_VERIFICACION_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateListaVerificacion(raw, prefill)}
      renderForm={(value, onChange) => <ListaVerificacionForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ListaVerificacionDocument data={value} />}
      pdfFilename={(value) => `Lista-verificacion-${sanitizeFilename(value.nombreCurso || "curso")}.pdf`}
    />
  );
}
