"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { LearningContractForm } from "./learning-contract-form";
import { LearningContractDocument } from "./learning-contract-document";
import {
  type LearningContractData,
  hydrateLearningContract,
  LEARNING_CONTRACT_TYPE,
} from "@/lib/planning/learning-contract";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string; instructorName?: string; duration?: string };
};

export function LearningContractClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<LearningContractData>
      courseId={courseId}
      type={LEARNING_CONTRACT_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateLearningContract(raw, prefill)}
      renderForm={(value, onChange) => <LearningContractForm value={value} onChange={onChange} />}
      renderDocument={(value) => <LearningContractDocument data={value} />}
      pdfFilename={(value) => `Contrato-aprendizaje-${sanitizeFilename(value.courseName || "curso")}.pdf`}
    />
  );
}
