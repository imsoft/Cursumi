"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ActivityScheduleForm } from "./activity-schedule-form";
import { ActivityScheduleDocument } from "./activity-schedule-document";
import {
  type ActivityScheduleData,
  hydrateActivitySchedule,
  ACTIVITY_SCHEDULE_TYPE,
} from "@/lib/planning/activity-schedule";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function ActivityScheduleClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ActivityScheduleData>
      courseId={courseId}
      type={ACTIVITY_SCHEDULE_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateActivitySchedule(raw, prefill)}
      seedFromCourse={() => hydrateActivitySchedule(null, prefill)}
      renderForm={(value, onChange) => <ActivityScheduleForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ActivityScheduleDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(ACTIVITY_SCHEDULE_TYPE, value.courseName)}
      pdfOrientation="landscape"
    />
  );
}
