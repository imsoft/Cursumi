"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ChecklistForm } from "./checklist-form";
import { ChecklistDocument } from "./checklist-document";
import {
  type ChecklistData,
  hydrateChecklist,
  CHECKLIST_TYPE,
} from "@/lib/planning/checklist";
import { buildPlanningFilename } from "@/lib/planning/registry";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string; instructorName?: string; duration?: string };
};

export function ChecklistClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ChecklistData>
      courseId={courseId}
      type={CHECKLIST_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateChecklist(raw, prefill)}
      seedFromCourse={() => hydrateChecklist(null, prefill)}
      renderForm={(value, onChange) => <ChecklistForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ChecklistDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(CHECKLIST_TYPE, value.courseName)}
    />
  );
}
