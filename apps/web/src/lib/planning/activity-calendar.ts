import type { PlanningPrefill } from "./prefill";

export const ACTIVITY_CALENDAR_TYPE = "activity-calendar" as const;

export type CalendarActivity = {
  id: string;
  name: string;
  weight: string;
  duration: string;
};

export type CalendarUnit = {
  id: string;
  name: string;
  scheduledDate: string; // "YYYY-MM-DD"
  activities: CalendarActivity[];
};

export type ActivityCalendarData = {
  courseName: string;
  generalWeight: string;
  units: CalendarUnit[];
};

export function emptyCalendarActivity(): CalendarActivity {
  return { id: crypto.randomUUID(), name: "", weight: "", duration: "" };
}

export function emptyCalendarUnit(): CalendarUnit {
  return {
    id: crypto.randomUUID(),
    name: "",
    scheduledDate: "",
    activities: [emptyCalendarActivity()],
  };
}

export function createEmptyActivityCalendar(prefill?: Partial<PlanningPrefill>): ActivityCalendarData {
  // Cada sección → unidad; cada lección → actividad
  const units: CalendarUnit[] = (prefill?.units ?? []).map((u) => ({
    id: crypto.randomUUID(),
    name: u.title,
    scheduledDate: "",
    activities: u.lessons.length
      ? u.lessons.map((l) => ({ id: crypto.randomUUID(), name: l.title, weight: "", duration: l.durationLabel }))
      : [emptyCalendarActivity()],
  }));

  return {
    courseName: prefill?.courseName ?? "",
    generalWeight: "",
    units: units.length > 0 ? units : [emptyCalendarUnit()],
  };
}

export function hydrateActivityCalendar(
  raw: unknown,
  prefill?: Parameters<typeof createEmptyActivityCalendar>[0],
): ActivityCalendarData {
  const base = createEmptyActivityCalendar(prefill);
  if (!raw || typeof raw !== "object") return base;
  const data = raw as Partial<ActivityCalendarData>;

  const units =
    Array.isArray(data.units) && data.units.length > 0
      ? data.units.map((u) => ({
          id: u.id || crypto.randomUUID(),
          name: u.name ?? "",
          scheduledDate: u.scheduledDate ?? "",
          activities:
            Array.isArray(u.activities) && u.activities.length > 0
              ? u.activities.map((a) => ({
                  id: a.id || crypto.randomUUID(),
                  name: a.name ?? "",
                  weight: a.weight ?? "0%",
                  duration: a.duration ?? "",
                }))
              : [emptyCalendarActivity()],
        }))
      : base.units;

  return { ...base, ...data, units };
}

export function formatCalendarDate(dateStr: string): string {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}
