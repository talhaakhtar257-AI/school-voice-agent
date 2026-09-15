import type { Lang } from "@/lib/language";

/**
 * Display formatting for the dashboard. Timestamps are stored in UTC and shown
 * in the school's time zone. The zone is always passed explicitly, so the
 * server render and the browser render produce the same text (no hydration
 * mismatch when the two machines sit in different zones).
 */
const SCHOOL_TIME_ZONE = "Asia/Karachi";

function localeFor(lang: Lang) {
  return lang === "ur" ? "ur-PK" : "en-GB";
}

export function formatDate(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleDateString(localeFor(lang), {
    timeZone: SCHOOL_TIME_ZONE,
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso: string, lang: Lang): string {
  return new Date(iso).toLocaleString(localeFor(lang), {
    timeZone: SCHOOL_TIME_ZONE,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** The school-local calendar day of an instant, as YYYY-MM-DD. */
export function schoolDateKey(instant: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SCHOOL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Short weekday name for a YYYY-MM-DD key. Noon UTC avoids any day rollover. */
export function formatDayLabel(dateKey: string, lang: Lang): string {
  return new Date(`${dateKey}T12:00:00Z`).toLocaleDateString(localeFor(lang), {
    weekday: "short",
    timeZone: "UTC",
  });
}

/**
 * The database's current_date is UTC, and reserve_voice_call() writes usage
 * against it, so usage lookups use the UTC day too.
 */
export function utcDateKey(instant = new Date()): string {
  return instant.toISOString().slice(0, 10);
}
