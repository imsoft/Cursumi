import { DESCRIPTIVE_CHART_TYPE } from "./descriptive-chart";
import { ACTIVITY_SCHEDULE_TYPE } from "./activity-schedule";
import { COURSE_INFO_TYPE } from "./course-info-document";
import { VIRTUAL_ACTIVITIES_GUIDE_TYPE } from "./virtual-activities-guide";
import { ACTIVITY_CALENDAR_TYPE } from "./activity-calendar";
import { VIRTUAL_PARTICIPANT_MANUAL_TYPE } from "./virtual-participant-manual";

export type CourseModality = "presencial" | "virtual";

export type PlanningDocMeta = {
  type: string;
  title: string;
  description: string;
  available: boolean;
  modality: CourseModality;
};

export const PLANNING_DOCUMENTS: PlanningDocMeta[] = [
  // ── Presencial (CONOCER / STPS) ────────────────────────────────────────────
  {
    type: DESCRIPTIVE_CHART_TYPE,
    title: "Carta descriptiva",
    description: "Documento de planeación del curso: información general, objetivos, requerimientos, evaluación, apertura, desarrollo y cierre.",
    available: true,
    modality: "presencial",
  },
  {
    type: "lista-verificacion",
    title: "Lista de verificación de requerimientos",
    description: "Comprobación de instalaciones, equipo, materiales, recursos humanos y seguridad antes del curso.",
    available: true,
    modality: "presencial",
  },
  {
    type: "lista-asistencia",
    title: "Lista de asistencia",
    description: "Registro de participantes y firmas por sesión.",
    available: true,
    modality: "presencial",
  },
  {
    type: "contrato-aprendizaje",
    title: "Contrato de aprendizaje",
    description: "Compromisos del facilitador y del participante, con firmas.",
    available: true,
    modality: "presencial",
  },
  {
    type: "evaluacion-diagnostica",
    title: "Evaluación diagnóstica",
    description: "Cuestionario inicial de conocimientos, con portada.",
    available: true,
    modality: "presencial",
  },
  {
    type: "evaluacion-formativa",
    title: "Evaluación formativa",
    description: "Cuestionario de seguimiento del aprendizaje, con portada.",
    available: true,
    modality: "presencial",
  },
  {
    type: "evaluacion-sumativa",
    title: "Evaluación sumativa",
    description: "Cuestionario final de conocimientos, con portada e instrucciones.",
    available: true,
    modality: "presencial",
  },
  {
    type: "evaluacion-calidad",
    title: "Evaluación de calidad",
    description: "Encuesta de satisfacción del participante por secciones (instructor, contenido, curso), con portada.",
    available: true,
    modality: "presencial",
  },
  {
    type: "hoja-respuestas",
    title: "Hoja de respuestas",
    description: "Clave de respuestas por temas, con la opción correcta resaltada, y portada.",
    available: true,
    modality: "presencial",
  },
  {
    type: "guia-actividades",
    title: "Guía de actividades de aprendizaje",
    description: "Actividades por unidad del curso: objetivo, criterios y tabla de actividades.",
    available: true,
    modality: "presencial",
  },
  {
    type: "manual-instructor",
    title: "Manual del instructor",
    description: "Guía de contenidos para el facilitador.",
    available: false,
    modality: "presencial",
  },
  {
    type: "manual-participante",
    title: "Manual del participante",
    description: "Manual del curso con portada, índice, secciones de contenido y bibliografía.",
    available: true,
    modality: "presencial",
  },
  {
    type: "constancia",
    title: "Constancia / reconocimiento",
    description: "Formato de constancia de participación.",
    available: false,
    modality: "presencial",
  },
  {
    type: "informe-final",
    title: "Informe final del curso",
    description: "Reporte de resultados y cierre del curso.",
    available: false,
    modality: "presencial",
  },

  // ── Virtual (video) ────────────────────────────────────────────────────────
  {
    type: ACTIVITY_SCHEDULE_TYPE,
    title: "Cronograma de actividades",
    description: "Diagrama de Gantt del proceso de producción del curso: actividades planeadas vs. reales, agrupadas por semana.",
    available: true,
    modality: "virtual",
  },
  {
    type: COURSE_INFO_TYPE,
    title: "Documento de información general",
    description: "Objetivo general, temas con objetivos particulares y horas, introducción, metodología, perfil de ingreso, evaluación y duración.",
    available: true,
    modality: "virtual",
  },
  {
    type: VIRTUAL_ACTIVITIES_GUIDE_TYPE,
    title: "Guía de actividades de aprendizaje",
    description: "Una página por unidad con objetivo, criterios de evaluación y tabla de actividades (instrucciones, materiales, participación, medio de entrega, ponderación).",
    available: true,
    modality: "virtual",
  },
  {
    type: ACTIVITY_CALENDAR_TYPE,
    title: "Calendario general de actividades",
    description: "Vista resumen de todas las unidades con fecha programada, actividades, ponderación y período de realización.",
    available: true,
    modality: "virtual",
  },
  {
    type: VIRTUAL_PARTICIPANT_MANUAL_TYPE,
    title: "Manual del participante",
    description: "Manual del curso con portada Cursumi, tabla de contenido, secciones de contenido en dos niveles y bibliografía.",
    available: true,
    modality: "virtual",
  },
];

export function getPlanningDocMeta(type: string): PlanningDocMeta | undefined {
  return PLANNING_DOCUMENTS.find((d) => d.type === type);
}

export function getPlanningDocsByModality(modality: CourseModality): PlanningDocMeta[] {
  return PLANNING_DOCUMENTS.filter((d) => d.modality === modality);
}

export function getPlanningTotal(modality: CourseModality): number {
  return PLANNING_DOCUMENTS.filter((d) => d.modality === modality && d.available).length;
}
