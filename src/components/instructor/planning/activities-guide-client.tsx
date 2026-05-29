"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { ActivitiesGuideForm } from "./activities-guide-form";
import { ActivitiesGuideDocument } from "./activities-guide-document";
import {
  type ActivitiesGuideData,
  hydrateActivitiesGuide,
  ACTIVITIES_GUIDE_TYPE,
} from "@/lib/planning/activities-guide";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string };
};

export function ActivitiesGuideClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<ActivitiesGuideData>
      courseId={courseId}
      type={ACTIVITIES_GUIDE_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateActivitiesGuide(raw, prefill)}
      renderForm={(value, onChange) => <ActivitiesGuideForm value={value} onChange={onChange} />}
      renderDocument={(value) => <ActivitiesGuideDocument data={value} />}
      pdfFilename={(value) => `Guia-de-actividades-${sanitizeFilename(value.courseName || "curso")}.pdf`}
    />
  );
}
