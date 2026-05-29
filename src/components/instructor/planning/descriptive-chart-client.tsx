"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { DescriptiveChartForm } from "./descriptive-chart-form";
import { DescriptiveChartDocument } from "./descriptive-chart-document";
import {
  type DescriptiveChartData,
  hydrateDescriptiveChart,
  DESCRIPTIVE_CHART_TYPE,
} from "@/lib/planning/descriptive-chart";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string; instructorName?: string; duration?: string };
};

export function DescriptiveChartClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<DescriptiveChartData>
      courseId={courseId}
      type={DESCRIPTIVE_CHART_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateDescriptiveChart(raw, prefill)}
      renderForm={(value, onChange) => <DescriptiveChartForm value={value} onChange={onChange} />}
      renderDocument={(value) => <DescriptiveChartDocument data={value} />}
      pdfFilename={(value) => `Carta-descriptiva-${sanitizeFilename(value.courseName || "curso")}.pdf`}
    />
  );
}
