import { prisma } from "@/lib/prisma";
import { getPlanningDocsByModality, type CourseModality } from "./registry";

export type PlanningExpedientStatus = {
  total: number;
  completed: number;
  isComplete: boolean;
  /** Títulos de los documentos disponibles que aún no están completados */
  missing: string[];
};

/**
 * Calcula el estado del expediente de planeación de un curso.
 * "Completo" = todos los documentos `available` de la modalidad están en estado "completed".
 * No hace autorización: los callers ya verifican la propiedad del curso.
 */
export async function getPlanningExpedientStatus(
  courseId: string,
  modality: CourseModality,
): Promise<PlanningExpedientStatus> {
  const available = getPlanningDocsByModality(modality).filter((d) => d.available);

  const completedDocs = await prisma.coursePlanningDocument.findMany({
    where: { courseId, status: "completed" },
    select: { type: true },
  });
  const completedTypes = new Set(completedDocs.map((d) => d.type));

  const missing = available.filter((d) => !completedTypes.has(d.type));
  const completed = available.length - missing.length;

  return {
    total: available.length,
    completed,
    // Sin documentos disponibles (modalidad sin planeación) no debe bloquear
    isComplete: available.length === 0 || missing.length === 0,
    missing: missing.map((d) => d.title),
  };
}
