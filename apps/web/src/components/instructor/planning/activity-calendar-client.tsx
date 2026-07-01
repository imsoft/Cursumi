"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ActivityCalendarForm } from "./activity-calendar-form";
import { ActivityCalendarDocument } from "./activity-calendar-document";
import {
  type ActivityCalendarData,
  hydrateActivityCalendar,
  ACTIVITY_CALENDAR_TYPE,
} from "@/lib/planning/activity-calendar";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function ActivityCalendarClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ActivityCalendarData>
      courseId={courseId}
      type={ACTIVITY_CALENDAR_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateActivityCalendar(raw, prefill)}
      seedFromCourse={() => hydrateActivityCalendar(null, prefill)}
      renderForm={(value, onChange) => <ActivityCalendarForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ActivityCalendarDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(ACTIVITY_CALENDAR_TYPE, value.courseName)}
    />
  );
}
