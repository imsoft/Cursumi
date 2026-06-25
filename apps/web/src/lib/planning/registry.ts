import { DESCRIPTIVE_CHART_TYPE } from "./descriptive-chart";
import { ACTIVITY_SCHEDULE_TYPE } from "./activity-schedule";
import { COURSE_INFO_TYPE } from "./course-info-document";
import { VIRTUAL_ACTIVITIES_GUIDE_TYPE } from "./virtual-activities-guide";
import { ACTIVITY_CALENDAR_TYPE } from "./activity-calendar";
import { VIRTUAL_PARTICIPANT_MANUAL_TYPE } from "./virtual-participant-manual";
import { MULTIMEDIA_MATERIAL_TYPE } from "./multimedia-material";
import { VIRTUAL_EVALUATION_TYPE } from "./virtual-evaluation";
import { COURSE_REVIEW_REPORT_TYPE } from "./course-review-report";
import { PRESENTATION_TYPE } from "./presentation";

export type CourseModality = "evento" | "virtual";

/** Modalidad de un documento: una específica o "both" (aplica a ambas). */
export type DocModality = CourseModality | "both";

export type PlanningDocMeta = {
  type: string;
  title: string;
  description: string;
  available: boolean;
  modality: DocModality;
};

export const PLANNING_DOCUMENTS: PlanningDocMeta[] = [
  // ── Evento (CONOCER / STPS) ────────────────────────────────────────────
  {
    type: DESCRIPTIVE_CHART_TYPE,
    title: "Carta descriptiva",
    description: "Documento de planeación del curso: información general, objetivos, requerimientos, evaluación, apertura, desarrollo y cierre.",
    available: true,
    modality: "evento",
  },
  {
    type: "lista-verificacion",
    title: "Lista de verificación de requerimientos",
    description: "Comprobación de instalaciones, equipo, materiales, recursos humanos y seguridad antes del curso.",
    available: true,
    modality: "evento",
  },
  {
    type: "lista-asistencia",
    title: "Lista de asistencia",
    description: "Registro de participantes y firmas por sesión.",
    available: true,
    modality: "evento",
  },
  {
    type: "contrato-aprendizaje",
    title: "Contrato de aprendizaje",
    description: "Compromisos del facilitador y del participante, con firmas.",
    available: true,
    modality: "evento",
  },
  {
    type: "evaluacion-diagnostica",
    title: "Evaluación diagnóstica",
    description: "Cuestionario inicial de conocimientos, con portada.",
    available: true,
    modality: "evento",
  },
  {
    type: "evaluacion-formativa",
    title: "Evaluación formativa",
    description: "Cuestionario de seguimiento del aprendizaje, con portada.",
    available: true,
    modality: "evento",
  },
  {
    type: "evaluacion-sumativa",
    title: "Evaluación sumativa",
    description: "Cuestionario final de conocimientos, con portada e instrucciones.",
    available: true,
    modality: "evento",
  },
  {
    type: "evaluacion-calidad",
    title: "Evaluación de calidad",
    description: "Encuesta de satisfacción del participante por secciones (instructor, contenido, curso), con portada.",
    available: true,
    modality: "evento",
  },
  {
    type: "hoja-respuestas",
    title: "Hoja de respuestas",
    description: "Clave de respuestas por temas, con la opción correcta resaltada, y portada.",
    available: true,
    modality: "evento",
  },
  {
    type: "guia-actividades",
    title: "Guía de actividades de aprendizaje",
    description: "Actividades por unidad del curso: objetivo, criterios y tabla de actividades.",
    available: true,
    modality: "evento",
  },
  {
    type: "manual-instructor",
    title: "Manual del instructor",
    description: "Guía de contenidos para el facilitador.",
    available: false,
    modality: "evento",
  },
  {
    type: "manual-participante",
    title: "Manual del participante",
    description: "Manual del curso con portada, índice, secciones de contenido y bibliografía.",
    available: true,
    modality: "evento",
  },
  {
    type: "constancia",
    title: "Constancia / reconocimiento",
    description: "Formato de constancia de participación.",
    available: false,
    modality: "evento",
  },
  {
    type: "informe-final",
    title: "Informe final del curso",
    description: "Reporte de resultados y cierre del curso.",
    available: false,
    modality: "evento",
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
  {
    type: MULTIMEDIA_MATERIAL_TYPE,
    title: "Material multimedia",
    description: "Documento de evidencias de los videos del curso: presentación + capturas de pantalla de cada video.",
    available: true,
    modality: "virtual",
  },
  {
    type: VIRTUAL_EVALUATION_TYPE,
    title: "Evaluación",
    description: "Cuestionarios de conocimiento por tema (con respuesta correcta resaltada) y cuestionario de calidad del curso.",
    available: true,
    modality: "virtual",
  },
  {
    type: COURSE_REVIEW_REPORT_TYPE,
    title: "Reporte de revisión del funcionamiento",
    description: "Observaciones de diseño, contenido y funcionalidad de la plataforma con propuestas de modificación.",
    available: true,
    modality: "virtual",
  },
  {
    type: PRESENTATION_TYPE,
    title: "Presentación del curso",
    description: "Diapositivas 16:9 con la marca Cursumi (portada, temas, contenido y cierre) para impartir o grabar el curso. Exporta a PDF widescreen.",
    available: true,
    modality: "both",
  },
];

export function getPlanningDocMeta(type: string): PlanningDocMeta | undefined {
  return PLANNING_DOCUMENTS.find((d) => d.type === type);
}

export function getPlanningDocsByModality(modality: CourseModality): PlanningDocMeta[] {
  return PLANNING_DOCUMENTS.filter((d) => d.modality === modality || d.modality === "both");
}

export function getPlanningTotal(modality: CourseModality): number {
  return PLANNING_DOCUMENTS.filter(
    (d) => (d.modality === modality || d.modality === "both") && d.available,
  ).length;
}

/**
 * Nombre de archivo descriptivo y consistente para descargar un documento:
 * "{Título del documento} - {Curso} - Cursumi.pdf".
 * Conserva espacios y acentos; solo elimina caracteres inválidos en nombres de archivo.
 */
export function buildPlanningFilename(type: string, courseName: string): string {
  const title = getPlanningDocMeta(type)?.title ?? "Documento de planeación";
  const course = (courseName || "").trim();
  const base = course ? `${title} - ${course}` : title;
  const clean = base
    .replace(/[\\/:*?"<>|]/g, "") // caracteres no válidos en nombres de archivo
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
  return `${clean} - Cursumi.pdf`;
}
