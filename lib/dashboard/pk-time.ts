/**
 * "Today" and "This week" in Pakistan time (FR-011). Pakistan is UTC+5 all
 * year — no daylight saving — so a fixed offset is exact.
 */
const PK_OFFSET_MS = 5 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** 00:00 today in Karachi, as a UTC instant. */
export function startOfTodayPk(now = new Date()): Date {
  const pkNow = now.getTime() + PK_OFFSET_MS;
  const pkMidnight = pkNow - (pkNow % DAY_MS);
  return new Date(pkMidnight - PK_OFFSET_MS);
}

/** 00:00 six days before today in Karachi: the last 7 days including today. */
export function startOfWeekPk(now = new Date()): Date {
  return new Date(startOfTodayPk(now).getTime() - 6 * DAY_MS);
}
