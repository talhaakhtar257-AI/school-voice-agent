import type { Lang } from "@/lib/language";

/**
 * Date and opening-hours helpers for the landing page. Pure functions: every
 * "now" is passed in or taken at call time, and the school's own time zone is
 * always used so a visitor abroad still sees Karachi's answer.
 */

type DateRange = { label: string; startDate: string; endDate: string };
type Hours = { days: string; opens: string; closes: string };
export type WindowStatus = "open" | "upcoming" | "closed";

const SCHOOL_TIME_ZONE = "Asia/Karachi";

/** Today's date at the school as YYYY-MM-DD. ISO dates compare correctly as strings. */
export function schoolToday(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

export function windowStatus(range: DateRange, today: string): WindowStatus {
  if (today < range.startDate) return "upcoming";
  if (today > range.endDate) return "closed";
  return "open";
}

/** The window a parent cares about now: the open one closing soonest, else the next to open. */
export function currentOrNextWindow(
  ranges: DateRange[],
  today: string,
): { range: DateRange; status: "open" | "upcoming" } | null {
  const valid = ranges.filter((r) => r.startDate && r.endDate);
  const open = valid
    .filter((r) => windowStatus(r, today) === "open")
    .sort((a, b) => a.endDate.localeCompare(b.endDate))[0];
  if (open) return { range: open, status: "open" };
  const next = valid
    .filter((r) => windowStatus(r, today) === "upcoming")
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
  return next ? { range: next, status: "upcoming" } : null;
}

/** "2027-03-31" → "31 Mar 2027" (or the Urdu month name). Noon UTC avoids a day rollover. */
export function formatDateKey(key: string, lang: Lang): string {
  const date = new Date(`${key}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return key;
  return date.toLocaleDateString(lang === "ur" ? "ur-PK" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const DAY_INDEX: Record<string, number> = {
  sun: 0, sunday: 0,
  mon: 1, monday: 1,
  tue: 2, tues: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
};

/**
 * Reads free-text days such as "Mon–Sat", "Monday to Friday" or "Mon, Wed,
 * Fri". Returns null as soon as any part is not understood — the caller then
 * hides the "open now" badge rather than guessing.
 */
export function parseDays(text: string): Set<number> | null {
  const cleaned = text
    .toLowerCase()
    .replace(/\(.*?\)/g, " ") // e.g. "(sample)"
    .replace(/[–—]/g, "-")
    .replace(/\b(to|through|till|until)\b/g, "-")
    .replace(/\s*-\s*/g, "-")
    .trim();
  if (!cleaned) return null;

  const days = new Set<number>();
  const parts = cleaned.split(/,|&|\/|\band\b/).map((part) => part.trim()).filter(Boolean);
  for (const part of parts) {
    const [from, to, extra] = part.split("-").map((piece) => piece.trim());
    if (extra !== undefined) return null;
    const start = DAY_INDEX[from];
    if (start === undefined) return null;
    if (to === undefined) {
      days.add(start);
      continue;
    }
    const end = DAY_INDEX[to];
    if (end === undefined) return null;
    for (let day = start; ; day = (day + 1) % 7) {
      days.add(day);
      if (day === end) break;
    }
  }
  return days.size > 0 ? days : null;
}

/** true or false for "is the office open right now", or null when the hours cannot be read. */
export function officeOpenNow(hours: Hours[], now = new Date()): boolean | null {
  if (hours.length === 0) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: SCHOOL_TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const weekday = DAY_INDEX[part("weekday").toLowerCase()];
  const time = `${part("hour")}:${part("minute")}`;
  if (weekday === undefined) return null;

  let open = false;
  for (const row of hours) {
    const days = parseDays(row.days);
    if (!days || !row.opens || !row.closes) return null;
    if (days.has(weekday) && row.opens <= time && time < row.closes) open = true;
  }
  return open;
}
