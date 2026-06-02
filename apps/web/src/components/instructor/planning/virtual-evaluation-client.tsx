"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { VirtualEvaluationForm } from "./virtual-evaluation-form";
import { VirtualEvaluationDocument } from "./virtual-evaluation-document";
import {
  type VirtualEvaluationData,
  hydrateVirtualEvaluation,
  VIRTUAL_EVALUATION_TYPE,
} from "@/lib/planning/virtual-evaluation";
import { buildPlanningFilename } from "@/lib/planning/registry";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string };
};

export function VirtualEvaluationClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<VirtualEvaluationData>
      courseId={courseId}
      type={VIRTUAL_EVALUATION_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateVirtualEvaluation(raw, prefill)}
      renderForm={(value, onChange) => <VirtualEvaluationForm value={value} onChange={onChange} />}
      renderDocument={(value) => <VirtualEvaluationDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(VIRTUAL_EVALUATION_TYPE, value.courseName)}
    />
  );
}
