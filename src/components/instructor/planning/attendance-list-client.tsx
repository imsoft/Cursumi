"use client";

import { PlanningDocShell } from "./planning-doc-shell";
import { AttendanceListForm } from "./attendance-list-form";
import { AttendanceListDocument } from "./attendance-list-document";
import {
  type AttendanceListData,
  hydrateAttendanceList,
  ATTENDANCE_LIST_TYPE,
} from "@/lib/planning/attendance-list";
import { sanitizeFilename } from "@/lib/planning/generate-pdf";

type Props = {
  courseId: string;
  initialData: unknown;
  initialStatus?: string;
  prefill?: { courseName?: string; instructorName?: string; duration?: string };
};

export function AttendanceListClient({ courseId, initialData, initialStatus, prefill }: Props) {
  return (
    <PlanningDocShell<AttendanceListData>
      courseId={courseId}
      type={ATTENDANCE_LIST_TYPE}
      initialData={initialData}
      initialStatus={initialStatus}
      hydrate={(raw) => hydrateAttendanceList(raw, prefill)}
      renderForm={(value, onChange) => <AttendanceListForm value={value} onChange={onChange} />}
      renderDocument={(value) => <AttendanceListDocument data={value} />}
      pdfFilename={(value) => `Lista-asistencia-${sanitizeFilename(value.courseName || "curso")}.pdf`}
    />
  );
}
