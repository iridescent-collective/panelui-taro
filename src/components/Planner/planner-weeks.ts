const DAY_MS = 24 * 60 * 60 * 1000;
const atMidnight = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};
export const addDaysLocal = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return atMidnight(copy);
};
export const startOfWeek = (date: Date, weekStartsOn: number): Date => {
  const start = ((weekStartsOn % 7) + 7) % 7;
  const midnight = atMidnight(date);
  const shift = (midnight.getDay() - start + 7) % 7;
  return addDaysLocal(midnight, -shift);
};
export const weekAnchor = (weekStart: Date): Date => addDaysLocal(weekStart, 3);
export const weekDays = (weekStart: Date): Date[] =>
  Array.from({ length: 7 }, (_unused, day) => addDaysLocal(weekStart, day));
export const weekRange = (
  anchor: Date,
  weekStartsOn: number,
  weeksBefore: number,
  weeksAfter: number
): Date[] => {
  const first = startOfWeek(anchor, weekStartsOn);
  const before = Math.max(0, Math.trunc(weeksBefore));
  const after = Math.max(0, Math.trunc(weeksAfter));
  return Array.from({ length: before + after + 1 }, (_unused, step) =>
    addDaysLocal(first, (step - before) * 7)
  );
};
export const weekIndex = (
  weeks: readonly Date[],
  date: Date,
  weekStartsOn: number
): number => {
  const [first] = weeks;
  if (!first) {
    return -1;
  }
  const target = startOfWeek(date, weekStartsOn);
  const index = Math.round((target.getTime() - first.getTime()) / (7 * DAY_MS));
  return index >= 0 && index < weeks.length ? index : -1;
};
