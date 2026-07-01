"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { InformeFinalForm } from "./informe-final-form";
import { InformeFinalDocument } from "./informe-final-document";
import { type InformeFinalData, hydrateInformeFinal, INFORME_FINAL_TYPE } from "@/lib/planning/informe-final";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function InformeFinalClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<InformeFinalData>
      courseId={courseId}
      type={INFORME_FINAL_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateInformeFinal(raw, prefill)}
      seedFromCourse={() => hydrateInformeFinal(null, prefill)}
      renderForm={(value, onChange) => <InformeFinalForm value={value} onChange={onChange} />}
      renderDocument={(value) => <InformeFinalDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(INFORME_FINAL_TYPE, value.courseName)}
    />
  );
}
