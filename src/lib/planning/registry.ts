import { DESCRIPTIVE_CHART_TYPE } from "./descriptive-chart";

export type PlanningDocMeta = {
  type: string;
  title: string;
  description: string;
  available: boolean;
};

export const PLANNING_DOCUMENTS: PlanningDocMeta[] = [
  {
    type: DESCRIPTIVE_CHART_TYPE,
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
  {
    type: "evaluacion-calidad",
    title: "Evaluación de calidad",
    description: "Encuesta de satisfacción del participante por secciones (instructor, contenido, curso), con portada.",
    available: true,
  },
  {
    type: "hoja-respuestas",
    title: "Hoja de respuestas",
    description: "Clave de respuestas por temas, con la opción correcta resaltada, y portada.",
    available: true,
  },
  {
    type: "guia-actividades",
    title: "Guía de actividades de aprendizaje",
    description: "Actividades por unidad del curso: objetivo, criterios y tabla de actividades.",
    available: true,
  },
  { type: "manual-instructor", title: "Manual del instructor", description: "Guía de contenidos para el facilitador.", available: false },
  {
    type: "manual-participante",
    title: "Manual del participante",
    description: "Manual del curso con portada, índice, secciones de contenido y bibliografía.",
    available: true,
  },
  { type: "constancia", title: "Constancia / reconocimiento", description: "Formato de constancia de participación.", available: false },
  { type: "informe-final", title: "Informe final del curso", description: "Reporte de resultados y cierre del curso.", available: false },
];

export function getPlanningDocMeta(type: string): PlanningDocMeta | undefined {
  return PLANNING_DOCUMENTS.find((d) => d.type === type);
}
