/**
 * Manual del instructor — misma estructura que el manual del participante
 * (secciones + bibliografía), pero es un documento independiente.
 */
import {
  type ParticipantManualData,
  createEmptyParticipantManual,
  hydrateParticipantManual,
} from "./participant-manual";
import type { PlanningPrefill } from "./prefill";

export const MANUAL_INSTRUCTOR_TYPE = "manual-instructor" as const;

export type InstructorManualData = ParticipantManualData;

export function createEmptyInstructorManual(prefill?: Partial<PlanningPrefill>): InstructorManualData {
  return createEmptyParticipantManual(prefill);
}

export function hydrateInstructorManual(raw: unknown, prefill?: Partial<PlanningPrefill>): InstructorManualData {
  return hydrateParticipantManual(raw, prefill);
}
