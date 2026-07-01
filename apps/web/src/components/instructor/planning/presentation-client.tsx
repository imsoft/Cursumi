"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { PresentationForm } from "./presentation-form";
import { PresentationDocument } from "./presentation-document";
import {
  type PresentationData,
  hydratePresentation,
  PRESENTATION_TYPE,
} from "@/lib/planning/presentation";
import { buildPlanningFilename } from "@/lib/planning/registry";
import { generateSlidesPdf } from "@/lib/planning/generate-pdf";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function PresentationClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<PresentationData>
      courseId={courseId}
      type={PRESENTATION_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydratePresentation(raw, prefill)}
      seedFromCourse={() => hydratePresentation(null, prefill)}
      renderForm={(value, onChange) => <PresentationForm value={value} onChange={onChange} />}
      renderDocument={(value) => <PresentationDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(PRESENTATION_TYPE, value.courseName)}
      exportPdf={(el, filename) => generateSlidesPdf(el, filename)}
    />
  );
}
