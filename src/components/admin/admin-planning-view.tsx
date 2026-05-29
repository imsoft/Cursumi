"use client";

import { useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { DescriptiveChartDocument } from "@/components/instructor/planning/descriptive-chart-document";
import { ChecklistDocument } from "@/components/instructor/planning/checklist-document";
import { AttendanceListDocument } from "@/components/instructor/planning/attendance-list-document";
import { LearningContractDocument } from "@/components/instructor/planning/learning-contract-document";
import { QuizAssessmentDocument } from "@/components/instructor/planning/quiz-assessment-document";
import { QualityAssessmentDocument } from "@/components/instructor/planning/quality-assessment-document";
import { AnswerSheetDocument } from "@/components/instructor/planning/answer-sheet-document";
import { ActivitiesGuideDocument } from "@/components/instructor/planning/activities-guide-document";
import { ParticipantManualDocument } from "@/components/instructor/planning/participant-manual-document";
import { ActivityScheduleDocument } from "@/components/instructor/planning/activity-schedule-document";
import { CourseInfoDocumentDocument } from "@/components/instructor/planning/course-info-document-document";
import { hydrateQualityAssessment, QUALITY_ASSESSMENT_TYPE } from "@/lib/planning/quality-assessment";
import { hydrateAnswerSheet, ANSWER_SHEET_TYPE } from "@/lib/planning/answer-sheet";
import { hydrateActivitiesGuide, ACTIVITIES_GUIDE_TYPE } from "@/lib/planning/activities-guide";
import { hydrateParticipantManual, PARTICIPANT_MANUAL_TYPE } from "@/lib/planning/participant-manual";
import { hydrateDescriptiveChart, DESCRIPTIVE_CHART_TYPE } from "@/lib/planning/descriptive-chart";
import { hydrateChecklist, CHECKLIST_TYPE } from "@/lib/planning/checklist";
import { hydrateAttendanceList, ATTENDANCE_LIST_TYPE } from "@/lib/planning/attendance-list";
import { hydrateLearningContract, LEARNING_CONTRACT_TYPE } from "@/lib/planning/learning-contract";
import {
  hydrateQuizAssessment,
  QUIZ_ASSESSMENT_TYPES,
  ASSESSMENT_TITLE,
  QUESTIONNAIRE_TITLE,
} from "@/lib/planning/quiz-assessment";
import { hydrateActivitySchedule, ACTIVITY_SCHEDULE_TYPE } from "@/lib/planning/activity-schedule";
import { hydrateCourseInfoDocument, COURSE_INFO_TYPE } from "@/lib/planning/course-info-document";
import { generateElementPdf, sanitizeFilename } from "@/lib/planning/generate-pdf";

function renderByType(type: string, data: unknown): { node: ReactNode; filename: string } | null {
  if (type === DESCRIPTIVE_CHART_TYPE) {
    const d = hydrateDescriptiveChart(data);
    return { node: <DescriptiveChartDocument data={d} />, filename: `Carta-descriptiva-${sanitizeFilename(d.courseName || "curso")}.pdf` };
  }
  if (type === CHECKLIST_TYPE) {
    const d = hydrateChecklist(data);
    return { node: <ChecklistDocument data={d} />, filename: `Lista-verificacion-${sanitizeFilename(d.courseName || "curso")}.pdf` };
  }
  if (type === ATTENDANCE_LIST_TYPE) {
    const d = hydrateAttendanceList(data);
    return { node: <AttendanceListDocument data={d} />, filename: `Lista-asistencia-${sanitizeFilename(d.courseName || "curso")}.pdf` };
  }
  if (type === LEARNING_CONTRACT_TYPE) {
    const d = hydrateLearningContract(data);
    return { node: <LearningContractDocument data={d} />, filename: `Contrato-aprendizaje-${sanitizeFilename(d.courseName || "curso")}.pdf` };
  }
  if (QUIZ_ASSESSMENT_TYPES.includes(type)) {
    const documentTitle = ASSESSMENT_TITLE[type] ?? "Evaluación";
    const fallbackQuestionnaireTitle = QUESTIONNAIRE_TITLE[type] ?? documentTitle;
    const d = hydrateQuizAssessment(data, fallbackQuestionnaireTitle);
    return {
      node: (
        <QuizAssessmentDocument documentTitle={documentTitle} fallbackQuestionnaireTitle={fallbackQuestionnaireTitle} data={d} />
      ),
      filename: `${sanitizeFilename(documentTitle)}-${sanitizeFilename(d.courseName || "curso")}.pdf`,
    };
  }
  if (type === QUALITY_ASSESSMENT_TYPE) {
    const d = hydrateQualityAssessment(data);
    return { node: <QualityAssessmentDocument data={d} />, filename: `Evaluacion-de-calidad-${sanitizeFilename(d.courseName || "curso")}.pdf` };
  }
  if (type === ANSWER_SHEET_TYPE) {
    const d = hydrateAnswerSheet(data);
    return { node: <AnswerSheetDocument data={d} />, filename: `Hoja-de-respuestas-${sanitizeFilename(d.courseName || "curso")}.pdf` };
  }
  if (type === ACTIVITIES_GUIDE_TYPE) {
    const d = hydrateActivitiesGuide(data);
    return { node: <ActivitiesGuideDocument data={d} />, filename: `Guia-de-actividades-${sanitizeFilename(d.courseName || "curso")}.pdf` };
  }
  if (type === PARTICIPANT_MANUAL_TYPE) {
    const d = hydrateParticipantManual(data);
    return { node: <ParticipantManualDocument data={d} />, filename: `Manual-del-participante-${sanitizeFilename(d.courseName || "curso")}.pdf` };
  }
  if (type === ACTIVITY_SCHEDULE_TYPE) {
    const d = hydrateActivitySchedule(data);
    return { node: <ActivityScheduleDocument data={d} />, filename: `Cronograma-${sanitizeFilename(d.courseName || "curso")}.pdf` };
  }
  if (type === COURSE_INFO_TYPE) {
    const d = hydrateCourseInfoDocument(data);
    return { node: <CourseInfoDocumentDocument data={d} />, filename: `Informacion-general-${sanitizeFilename(d.courseName || "curso")}.pdf` };
  }
  return null;
}

export function AdminPlanningDocView({ type, data }: { type: string; data: unknown }) {
  const docRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const rendered = renderByType(type, data);

  if (!rendered) {
    return (
      <p className="text-sm text-muted-foreground">
        Vista previa no disponible para este tipo de documento todavía.
      </p>
    );
  }

  const handleDownload = async () => {
    if (!docRef.current) return;
    setDownloading(true);
    try {
      await generateElementPdf(docRef.current, rendered.filename);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" className="gap-2" onClick={handleDownload} disabled={downloading}>
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Descargar PDF
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-border bg-white p-4">
        <div ref={docRef} className="mx-auto">
          {rendered.node}
        </div>
      </div>
    </div>
  );
}
