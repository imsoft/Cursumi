"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { VirtualActivitiesGuideForm } from "./virtual-activities-guide-form";
import { VirtualActivitiesGuideDocument } from "./virtual-activities-guide-document";
import {
  type VirtualActivitiesGuideData,
  hydrateVirtualActivitiesGuide,
  VIRTUAL_ACTIVITIES_GUIDE_TYPE,
} from "@/lib/planning/virtual-activities-guide";
import { buildPlanningFilename } from "@/lib/planning/registry";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string };
};

export function VirtualActivitiesGuideClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<VirtualActivitiesGuideData>
      courseId={courseId}
      type={VIRTUAL_ACTIVITIES_GUIDE_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateVirtualActivitiesGuide(raw, prefill)}
      renderForm={(value, onChange) => <VirtualActivitiesGuideForm value={value} onChange={onChange} />}
      renderDocument={(value) => <VirtualActivitiesGuideDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(VIRTUAL_ACTIVITIES_GUIDE_TYPE, value.courseName)}
    />
  );
}
