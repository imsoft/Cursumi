"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ConstanciaForm } from "./constancia-form";
import { ConstanciaDocument } from "./constancia-document";
import { type ConstanciaData, hydrateConstancia, CONSTANCIA_TYPE } from "@/lib/planning/constancia";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function ConstanciaClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ConstanciaData>
      courseId={courseId}
      type={CONSTANCIA_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateConstancia(raw, prefill)}
      seedFromCourse={() => hydrateConstancia(null, prefill)}
      renderForm={(value, onChange) => <ConstanciaForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ConstanciaDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(CONSTANCIA_TYPE, value.courseName)}
    />
  );
}
