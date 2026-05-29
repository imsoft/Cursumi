export const ATTENDANCE_LIST_TYPE = "lista-asistencia" as const;

export type AttendanceRow = {
  id: string;
  name: string;
};

export type AttendanceListData = {
  courseName: string;
  instructorName: string;
  location: string;
  duration: string;
  schedule: string;
  date: string;
  participants: AttendanceRow[];
};

const DEFAULT_ROWS = 10;

export function emptyRow(): AttendanceRow {
  return { id: crypto.randomUUID(), name: "" };
}

export function createEmptyAttendanceList(prefill?: {
  courseName?: string;
  instructorName?: string;
  duration?: string;
}): AttendanceListData {
  return {
    courseName: prefill?.courseName ?? "",
    instructorName: prefill?.instructorName ?? "",
    location: "",
    duration: prefill?.duration ?? "",
    schedule: "",
    date: "",
    participants: Array.from({ length: DEFAULT_ROWS }, emptyRow),
  };
}

export function hydrateAttendanceList(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyAttendanceList>[0],
): AttendanceListData {
  const base = createEmptyAttendanceList(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<AttendanceListData>;

  const participants =
    Array.isArray(data.participants) && data.participants.length > 0
      ? data.participants.map((p) => ({ id: p.id || crypto.randomUUID(), name: p.name ?? "" }))
      : base.participants;

  return { ...base, ...data, participants };
}
