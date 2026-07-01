"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ActivitiesGuideForm } from "./activities-guide-form";
import { ActivitiesGuideDocument } from "./activities-guide-document";
import {
  type ActivitiesGuideData,
  hydrateActivitiesGuide,
  ACTIVITIES_GUIDE_TYPE,
} from "@/lib/planning/activities-guide";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function ActivitiesGuideClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ActivitiesGuideData>
      courseId={courseId}
      type={ACTIVITIES_GUIDE_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateActivitiesGuide(raw, prefill)}
      seedFromCourse={() => hydrateActivitiesGuide(null, prefill)}
      renderForm={(value, onChange) => <ActivitiesGuideForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ActivitiesGuideDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(ACTIVITIES_GUIDE_TYPE, value.courseName)}
    />
  );
}
