import type { PlanningPrefill } from "./prefill";

export const LEARNING_CONTRACT_TYPE = "contrato-aprendizaje" as const;

export type CommitmentRow = {
  id: string;
  description: string;
};

export type LearningContractData = {
  courseName: string;
  instructorName: string;
  location: string;
  duration: string;
  schedule: string;
  date: string;
  facilitatorCommitments: CommitmentRow[];
  participantCommitments: CommitmentRow[];
};

export function emptyCommitment(description = ""): CommitmentRow {
  return { id: crypto.randomUUID(), description };
}

export function createEmptyLearningContract(prefill?: Partial<PlanningPrefill>): LearningContractData {
  return {
    courseName: prefill?.courseName ?? "",
    instructorName: prefill?.instructorName ?? "",
    location: prefill?.location ?? "",
    duration: prefill?.duration ?? "",
    schedule: prefill?.schedule ?? "",
    date: prefill?.startDate ?? "",
    facilitatorCommitments: [emptyCommitment()],
    participantCommitments: [emptyCommitment()],
  };
}

export function hydrateLearningContract(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyLearningContract>[0],
): LearningContractData {
  const base = createEmptyLearningContract(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<LearningContractData>;

  const ensureRows = (rows: CommitmentRow[] | undefined, fallback: CommitmentRow[]): CommitmentRow[] => {
    if (!Array.isArray(rows)) return fallback;
    if (rows.length === 0) return [emptyCommitment()];
    return rows.map((r) => ({ id: r.id || crypto.randomUUID(), description: r.description ?? "" }));
  };

  return {
    ...base,
    ...data,
    facilitatorCommitments: ensureRows(data.facilitatorCommitments, base.facilitatorCommitments),
    participantCommitments: ensureRows(data.participantCommitments, base.participantCommitments),
  };
}
