type AgeRange = { minYears: number; maxYears: number };

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Completed years between a date of birth and another date, both YYYY-MM-DD.
 * Returns null for a malformed date or a birth date after the other date.
 */
export function ageOnDate(dateOfBirth: string, onDate: string): number | null {
  const birth = ISO_DATE.exec(dateOfBirth);
  const on = ISO_DATE.exec(onDate);
  if (!birth || !on) return null;
  const [birthYear, birthMonth, birthDay] = birth.slice(1).map(Number);
  const [year, month, day] = on.slice(1).map(Number);
  let age = year - birthYear;
  if (month < birthMonth || (month === birthMonth && day < birthDay)) age -= 1;
  return age >= 0 ? age : null;
}

/** A class with no age entered (0–0) never matches — it would match every newborn. */
export function hasAgeRange(range: AgeRange | undefined): range is AgeRange {
  return range !== undefined && !(range.minYears === 0 && range.maxYears === 0);
}

/** The published classes whose age range includes this age, in published order. */
export function classesForAge(
  classes: string[],
  ageCriteria: Record<string, AgeRange>,
  age: number,
): string[] {
  return classes.filter((name) => {
    const range = ageCriteria[name];
    return hasAgeRange(range) && age >= range.minYears && age <= range.maxYears;
  });
}
