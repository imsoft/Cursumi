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

const DEFAULT_FACILITATOR = [
  "Se compromete a respetar a los participantes y escuchar y entender las dudas que tengan.",
  "Se compromete a impartir de manera clara y directa toda la información del curso.",
  "Se compromete a proporcionar todo el material que necesitan los participantes para cumplir con el curso.",
  "Se compromete a evaluar de manera correcta y justa a todos los participantes.",
];

const DEFAULT_PARTICIPANT = [
  "Se compromete a prestar atención en todo momento.",
  "Se compromete a respetar al instructor y a sus compañeros en todo momento.",
  "Se compromete a ser participativo en las actividades que sean impartidas durante el curso.",
  "Se compromete a exponer sus dudas con respeto.",
  "Se compromete a cuidar y respetar el material didáctico y material del lugar.",
  "Se compromete a no divulgar el material de estudio sin permiso.",
];

export function emptyCommitment(description = ""): CommitmentRow {
  return { id: crypto.randomUUID(), description };
}

export function createEmptyLearningContract(prefill?: {
  courseName?: string;
  instructorName?: string;
  duration?: string;
}): LearningContractData {
  return {
    courseName: prefill?.courseName ?? "",
    instructorName: prefill?.instructorName ?? "",
    location: "",
    duration: prefill?.duration ?? "",
    schedule: "",
    date: "",
    facilitatorCommitments: DEFAULT_FACILITATOR.map((d) => emptyCommitment(d)),
    participantCommitments: DEFAULT_PARTICIPANT.map((d) => emptyCommitment(d)),
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
