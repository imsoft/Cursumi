"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { CartaDescriptivaForm } from "./carta-descriptiva-form";
import { CartaDescriptivaDocument } from "./carta-descriptiva-document";
import {
  type CartaDescriptivaData,
  hydrateCartaDescriptiva,
  CARTA_DESCRIPTIVA_TYPE,
} from "@/lib/planning/carta-descriptiva";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { nombreCurso?: string; nombreInstructor?: string; duracion?: string };
};

export function CartaDescriptivaClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<CartaDescriptivaData>
      courseId={courseId}
      type={CARTA_DESCRIPTIVA_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateCartaDescriptiva(raw, prefill)}
      renderForm={(value, onChange) => <CartaDescriptivaForm value={value} onChange={onChange} />}
      renderDocument={(value) => <CartaDescriptivaDocument data={value} />}
      pdfFilename={(value) => `Carta-descriptiva-${sanitizeFilename(value.nombreCurso || "curso")}.pdf`}
    />
  );
}
