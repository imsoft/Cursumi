import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCourseDetailForUser } from "@/app/actions/course-actions";
import { getPlanningDocument, getPlanningPrefill } from "@/app/actions/planning-actions";
import { getPlanningDocMeta } from "@/lib/planning/registry";
// ── Presencial ────────────────────────────────────────────────────────────────
import { DESCRIPTIVE_CHART_TYPE } from "@/lib/planning/descriptive-chart";
import { CHECKLIST_TYPE } from "@/lib/planning/checklist";
import { ATTENDANCE_LIST_TYPE } from "@/lib/planning/attendance-list";
import { LEARNING_CONTRACT_TYPE } from "@/lib/planning/learning-contract";
import { QUIZ_ASSESSMENT_TYPES } from "@/lib/planning/quiz-assessment";
import { QUALITY_ASSESSMENT_TYPE } from "@/lib/planning/quality-assessment";
import { ANSWER_SHEET_TYPE } from "@/lib/planning/answer-sheet";
import { ACTIVITIES_GUIDE_TYPE } from "@/lib/planning/activities-guide";
import { PARTICIPANT_MANUAL_TYPE } from "@/lib/planning/participant-manual";
import { DescriptiveChartClient } from "@/components/instructor/planning/descriptive-chart-client";
import { ChecklistClient } from "@/components/instructor/planning/checklist-client";
import { AttendanceListClient } from "@/components/instructor/planning/attendance-list-client";
import { LearningContractClient } from "@/components/instructor/planning/learning-contract-client";
import { QuizAssessmentClient } from "@/components/instructor/planning/quiz-assessment-client";
import { QualityAssessmentClient } from "@/components/instructor/planning/quality-assessment-client";
import { AnswerSheetClient } from "@/components/instructor/planning/answer-sheet-client";
import { ActivitiesGuideClient } from "@/components/instructor/planning/activities-guide-client";
import { ParticipantManualClient } from "@/components/instructor/planning/participant-manual-client";
// ── Virtual ───────────────────────────────────────────────────────────────────
import { ACTIVITY_SCHEDULE_TYPE } from "@/lib/planning/activity-schedule";
import { ActivityScheduleClient } from "@/components/instructor/planning/activity-schedule-client";
import { COURSE_INFO_TYPE } from "@/lib/planning/course-info-document";
import { CourseInfoDocumentClient } from "@/components/instructor/planning/course-info-document-client";
import { VIRTUAL_ACTIVITIES_GUIDE_TYPE } from "@/lib/planning/virtual-activities-guide";
import { VirtualActivitiesGuideClient } from "@/components/instructor/planning/virtual-activities-guide-client";
import { ACTIVITY_CALENDAR_TYPE } from "@/lib/planning/activity-calendar";
import { ActivityCalendarClient } from "@/components/instructor/planning/activity-calendar-client";

export default async function PlanningDocumentPage({
  params,
}: {
  params: Promise<{ id: string; type: string }>;
}) {
  const { id, type } = await params;
  const course = await getCourseDetailForUser(id).catch(() => null);
  const meta = getPlanningDocMeta(type);

  if (!course || !meta) {
    return <div className="p-8 text-center text-muted-foreground">Documento no encontrado.</div>;
  }

  const Header = (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/instructor/courses/${id}/planning`}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a planeación
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{meta.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{course.title}</p>
      </div>
    </div>
  );

  if (!meta.available) {
    return (
      <div className="space-y-6">
        {Header}
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
          Este documento estará disponible próximamente.
        </div>
      </div>
    );
  }

  const [doc, prefill] = await Promise.all([
    getPlanningDocument(id, type).catch(() => null),
    getPlanningPrefill(id).catch(() => undefined),
  ]);

  return (
    <div className="space-y-6">
      {Header}

      {/* ── Presencial ── */}
      {type === DESCRIPTIVE_CHART_TYPE && (
        <DescriptiveChartClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === CHECKLIST_TYPE && (
        <ChecklistClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === ATTENDANCE_LIST_TYPE && (
        <AttendanceListClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === LEARNING_CONTRACT_TYPE && (
        <LearningContractClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {QUIZ_ASSESSMENT_TYPES.includes(type) && (
        <QuizAssessmentClient courseId={id} type={type} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === QUALITY_ASSESSMENT_TYPE && (
        <QualityAssessmentClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === ANSWER_SHEET_TYPE && (
        <AnswerSheetClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === ACTIVITIES_GUIDE_TYPE && (
        <ActivitiesGuideClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}
      {type === PARTICIPANT_MANUAL_TYPE && (
        <ParticipantManualClient courseId={id} initialData={doc?.data ?? null} initialStatus={doc?.status} prefill={prefill} />
      )}

      {/* ── Virtual ── */}
      {type === ACTIVITY_SCHEDULE_TYPE && (
        <ActivityScheduleClient
          courseId={id}
          initialData={doc?.data ?? null}
          initialStatus={doc?.status}
          prefill={{ courseName: prefill?.courseName, instructorName: prefill?.instructorName }}
        />
      )}
      {type === COURSE_INFO_TYPE && (
        <CourseInfoDocumentClient
          courseId={id}
          initialData={doc?.data ?? null}
          initialStatus={doc?.status}
          prefill={{ courseName: prefill?.courseName, instructorName: prefill?.instructorName }}
        />
      )}
      {type === VIRTUAL_ACTIVITIES_GUIDE_TYPE && (
        <VirtualActivitiesGuideClient
          courseId={id}
          initialData={doc?.data ?? null}
          initialStatus={doc?.status}
          prefill={{ courseName: prefill?.courseName }}
        />
      )}
      {type === ACTIVITY_CALENDAR_TYPE && (
        <ActivityCalendarClient
          courseId={id}
          initialData={doc?.data ?? null}
          initialStatus={doc?.status}
          prefill={{ courseName: prefill?.courseName }}
        />
      )}
    </div>
  );
}
