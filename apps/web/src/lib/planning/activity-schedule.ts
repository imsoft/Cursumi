import type { PlanningPrefill } from "./prefill";

export const ACTIVITY_SCHEDULE_TYPE = "cronograma-actividades" as const;

export type ScheduleActivity = {
  id: string;
  name: string;
  planStart: number;
  planDuration: number;
  realStart: number;    // 0 = not started yet
  realDuration: number; // 0 = not finished yet
};

export type ActivityScheduleData = {
  courseName: string;
  /** ISO date "YYYY-MM-DD" — doubles as Gantt start date */
  creationDate: string;
  objective: string;
  totalPeriods: number;
  highlightedPeriod: number;
  elaboratedBy: string;
  approvedBy: string;
  activities: ScheduleActivity[];
};

// ── Date utilities ─────────────────────────────────────────────────────────

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** Returns an array of working-day Dates (Mon–Fri) starting from startDateStr. */
export function computePeriodDates(startDateStr: string, totalPeriods: number): Date[] {
  if (!startDateStr || totalPeriods <= 0) return [];
  // Use noon to avoid DST edge cases
  const start = new Date(startDateStr + "T12:00:00");
  const cursor = new Date(start);

  // Move to first weekday
  while (cursor.getDay() === 0 || cursor.getDay() === 6) {
    cursor.setDate(cursor.getDate() + 1);
  }

  const dates: Date[] = [];
  while (dates.length < totalPeriods) {
    if (cursor.getDay() !== 0 && cursor.getDay() !== 6) {
      dates.push(new Date(cursor));
    }
    if (dates.length < totalPeriods) cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

export type WeekGroup = {
  label: string;
  /** 0-based indices into the dates array */
  indices: number[];
};

/** Groups period indices by calendar week. */
export function computeWeekGroups(dates: Date[]): WeekGroup[] {
  if (dates.length === 0) return [];
  const groups: WeekGroup[] = [];
  let weekNum = 1;
  let currentKey = "";

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    const key = `${d.getFullYear()}-${getISOWeek(d)}`;
    if (key !== currentKey) {
      groups.push({ label: `SEMANA ${weekNum}`, indices: [i] });
      weekNum++;
      currentKey = key;
    } else {
      groups[groups.length - 1].indices.push(i);
    }
  }
  return groups;
}

const MONTHS_ES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const MONTHS_FULL_ES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

export function formatPeriodDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = MONTHS_ES[date.getMonth()];
  const year = String(date.getFullYear()).slice(2);
  return `${day}-${month}-${year}`;
}

export function formatDateES(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T12:00:00");
  return `${d.getDate()} de ${MONTHS_FULL_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

export function emptyActivity(planStart = 0): ScheduleActivity {
  return { id: crypto.randomUUID(), name: "", planStart, planDuration: 0, realStart: 0, realDuration: 0 };
}

export function createEmptyActivitySchedule(prefill?: Partial<PlanningPrefill>): ActivityScheduleData {
  const today = new Date().toISOString().slice(0, 10);
  // Una actividad por lección del curso (secuencial en el Gantt)
  const lessonActivities: ScheduleActivity[] = (prefill?.units ?? [])
    .flatMap((u) => u.lessons.map((l) => l.title))
    .map((name, index) => ({
      id: crypto.randomUUID(),
      name,
      planStart: index + 1,
      planDuration: 1,
      realStart: 0,
      realDuration: 0,
    }));

  return {
    courseName: prefill?.courseName ?? "",
    creationDate: prefill?.startDate || today,
    objective: prefill?.description ?? "",
    totalPeriods: lessonActivities.length,
    highlightedPeriod: 0,
    elaboratedBy: prefill?.instructorName ?? "",
    approvedBy: prefill?.instructorName ?? "",
    activities: lessonActivities.length > 0 ? lessonActivities : [emptyActivity()],
  };
}

export function hydrateActivitySchedule(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyActivitySchedule>[0],
): ActivityScheduleData {
  const base = createEmptyActivitySchedule(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ActivityScheduleData>;

  const activities =
    Array.isArray(data.activities) && data.activities.length > 0
      ? data.activities.map((a) => ({
          id: a.id || crypto.randomUUID(),
          name: a.name ?? "",
          planStart: typeof a.planStart === "number" ? a.planStart : 1,
          planDuration: typeof a.planDuration === "number" ? a.planDuration : 1,
          realStart: typeof a.realStart === "number" ? a.realStart : 0,
          realDuration: typeof a.realDuration === "number" ? a.realDuration : 0,
        }))
      : base.activities;

  return {
    ...base,
    ...data,
    totalPeriods: typeof data.totalPeriods === "number" && data.totalPeriods > 0 ? data.totalPeriods : base.totalPeriods,
    highlightedPeriod: typeof data.highlightedPeriod === "number" ? data.highlightedPeriod : base.highlightedPeriod,
    activities,
  };
}
