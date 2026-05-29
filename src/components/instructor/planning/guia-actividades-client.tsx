"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { GuiaActividadesForm } from "./guia-actividades-form";
import { GuiaActividadesDocument } from "./guia-actividades-document";
import {
  type GuiaActividadesData,
  hydrateGuiaActividades,
  GUIA_ACTIVIDADES_TYPE,
} from "@/lib/planning/guia-actividades";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string };
};

export function GuiaActividadesClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<GuiaActividadesData>
      courseId={courseId}
      type={GUIA_ACTIVIDADES_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateGuiaActividades(raw, prefill)}
      renderForm={(value, onChange) => <GuiaActividadesForm value={value} onChange={onChange} />}
      renderDocument={(value) => <GuiaActividadesDocument data={value} />}
      pdfFilename={(value) => `Guia-de-actividades-${sanitizeFilename(value.nombreCurso || "curso")}.pdf`}
    />
  );
}
