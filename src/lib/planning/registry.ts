/**
 * Registro de documentos de planeación didáctica / certificación.
 *
 * Por ahora solo "carta-descriptiva" está implementado; el resto quedan listados
 * como "próximamente" para construirlos sobre la misma plantilla base.
 */

import { CARTA_DESCRIPTIVA_TYPE } from "./carta-descriptiva";

export type PlanningDocMeta = {
  type: string;
  title: string;
  description: string;
  /** true si el formulario y el PDF ya están implementados. */
  available: boolean;
};

export const PLANNING_DOCUMENTS: PlanningDocMeta[] = [
  {
    type: CARTA_DESCRIPTIVA_TYPE,
    title: "Carta descriptiva",
    description:
      "Documento de planeación del curso: información general, objetivos, requerimientos, evaluación, apertura, desarrollo y cierre.",
    available: true,
  },
  {
    type: "lista-verificacion",
    title: "Lista de verificación de requerimientos",
    description: "Comprobación de instalaciones, equipo, materiales, recursos humanos y seguridad antes del curso.",
    available: true,
  },
  {
    type: "lista-asistencia",
    title: "Lista de asistencia",
    description: "Registro de participantes y firmas por sesión.",
    available: true,
  },
  {
    type: "contrato-aprendizaje",
    title: "Contrato de aprendizaje",
    description: "Compromisos del facilitador y del participante, con firmas.",
    available: true,
  },
  {
    type: "evaluacion-diagnostica",
    title: "Evaluación diagnóstica",
    description: "Cuestionario inicial de conocimientos, con portada.",
    available: true,
  },
  {
    type: "evaluacion-formativa",
    title: "Evaluación formativa",
    description: "Cuestionario de seguimiento del aprendizaje, con portada.",
    available: true,
  },
  {
    type: "evaluacion-sumativa",
    title: "Evaluación sumativa",
    description: "Cuestionario final de conocimientos, con portada e instrucciones.",
    available: true,
  },
  // Los siguientes documentos se irán habilitando sobre la misma plantilla base.
  {
    type: "evaluacion-calidad",
    title: "Evaluación de calidad",
    description: "Encuesta de satisfacción del participante por secciones (instructor, contenido, curso), con portada.",
    available: true,
  },
  { type: "manual-instructor", title: "Manual del instructor", description: "Guía de contenidos para el facilitador.", available: false },
  { type: "manual-participante", title: "Manual del participante", description: "Material de apoyo para el alumno.", available: false },
  { type: "constancia", title: "Constancia / reconocimiento", description: "Formato de constancia de participación.", available: false },
  { type: "informe-final", title: "Informe final del curso", description: "Reporte de resultados y cierre del curso.", available: false },
];

export function getPlanningDocMeta(type: string): PlanningDocMeta | undefined {
  return PLANNING_DOCUMENTS.find((d) => d.type === type);
}
