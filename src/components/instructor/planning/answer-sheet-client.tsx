"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { AnswerSheetForm } from "./answer-sheet-form";
import { AnswerSheetDocument } from "./answer-sheet-document";
import {
  type AnswerSheetData,
  hydrateAnswerSheet,
  ANSWER_SHEET_TYPE,
} from "@/lib/planning/answer-sheet";
import { buildPlanningFilename } from "@/lib/planning/registry";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string; instructorName?: string; duration?: string };
};

export function AnswerSheetClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<AnswerSheetData>
      courseId={courseId}
      type={ANSWER_SHEET_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateAnswerSheet(raw, prefill)}
      renderForm={(value, onChange) => <AnswerSheetForm value={value} onChange={onChange} />}
      renderDocument={(value) => <AnswerSheetDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(ANSWER_SHEET_TYPE, value.courseName)}
    />
  );
}
