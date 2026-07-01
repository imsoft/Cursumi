"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { DescriptiveChartForm } from "./descriptive-chart-form";
import { DescriptiveChartDocument } from "./descriptive-chart-document";
import {
  type DescriptiveChartData,
  hydrateDescriptiveChart,
  DESCRIPTIVE_CHART_TYPE,
} from "@/lib/planning/descriptive-chart";
import { buildPlanningFilename } from "@/lib/planning/registry";
import type { PlanningPrefill } from "@/lib/planning/prefill";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: Partial<PlanningPrefill>;
};

export function DescriptiveChartClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<DescriptiveChartData>
      courseId={courseId}
      type={DESCRIPTIVE_CHART_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateDescriptiveChart(raw, prefill)}
      seedFromCourse={() => hydrateDescriptiveChart(null, prefill)}
      renderForm={(value, onChange) => <DescriptiveChartForm value={value} onChange={onChange} />}
      renderDocument={(value) => <DescriptiveChartDocument data={value} />}
      pdfFilename={(value) => buildPlanningFilename(DESCRIPTIVE_CHART_TYPE, value.courseName)}
    />
  );
}
