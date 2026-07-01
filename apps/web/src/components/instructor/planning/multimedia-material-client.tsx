"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { MultimediaMaterialForm } from "./multimedia-material-form";
import { MultimediaMaterialDocument } from "./multimedia-material-document";
import {
  type MultimediaMaterialData,
  hydrateMultimediaMaterial,
  MULTIMEDIA_MATERIAL_TYPE,
} from "@/lib/planning/multimedia-material";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function MultimediaMaterialClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<MultimediaMaterialData>
      courseId={courseId}
      type={MULTIMEDIA_MATERIAL_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateMultimediaMaterial(raw, prefill)}
      seedFromCourse={() => hydrateMultimediaMaterial(null, prefill)}
      renderForm={(value, onChange) => <MultimediaMaterialForm value={value} onChange={onChange} />}
      renderDocument={(value) => <MultimediaMaterialDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(MULTIMEDIA_MATERIAL_TYPE, value.courseName)}
    />
  );
}
