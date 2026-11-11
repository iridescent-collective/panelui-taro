import { sortCopy } from "./sort-copy";

export type DateLocale = string | undefined;
export const startOfDay = (date: Date): Date => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};
export const isSameDay = (
  a: Date | null | undefined,
  b: Date | null | undefined
): boolean => {
  if (!a || !b) {
    return false;
  }
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};
export const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
export const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);
export const endOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth() + 1, 0);
export const addMonths = (date: Date, months: number): Date => {
  const copy = new Date(date.getFullYear(), date.getMonth(), 1);
  copy.setMonth(copy.getMonth() + months);
  return copy;
};
export const addDays = (date: Date, days: number): Date => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};
export const isBefore = (a: Date, b: Date): boolean =>
  startOfDay(a).getTime() < startOfDay(b).getTime();
export const isAfter = (a: Date, b: Date): boolean =>
  startOfDay(a).getTime() > startOfDay(b).getTime();
export const isWithin = (date: Date, from: Date, to: Date): boolean => {
  const time = startOfDay(date).getTime();
  const start = startOfDay(from).getTime();
  const end = startOfDay(to).getTime();
  return time >= Math.min(start, end) && time <= Math.max(start, end);
};
export const clampDate = (date: Date, min?: Date, max?: Date): Date => {
  if (min && isBefore(date, min)) {
    return startOfDay(min);
  }
  if (max && isAfter(date, max)) {
    return startOfDay(max);
  }
  return date;
};
export const normalizeWeekStart = (weekStartsOn: number): number => {
  if (!Number.isFinite(weekStartsOn)) {
    return 0;
  }
  return ((Math.trunc(weekStartsOn) % 7) + 7) % 7;
};
export const localeWeekStart = (locale: DateLocale): number => {
  try {
    const tag = (locale ?? "en").split("-u-")[0] || "en";
    const resolved = new Intl.Locale(tag) as Intl.Locale & {
      getWeekInfo?: () => {
        firstDay?: number;
      };
      weekInfo?: {
        firstDay?: number;
      };
    };
    const info = resolved.getWeekInfo?.() ?? resolved.weekInfo;
    const first = info?.firstDay;
    if (typeof first === "number" && Number.isFinite(first)) {
      return first % 7;
    }
  } catch {
    return 0;
  }
  return 0;
};
export interface CalendarParts {
  year: number;
  month: number;
  day: number;
}
const formatters = new Map<string, Intl.DateTimeFormat | null>();
const formatter = (
  locale: DateLocale,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat | null => {
  const shape = sortCopy(Object.keys(options), (left, right) =>
    left.localeCompare(right)
  )
    .map(
      (key) =>
        `${key}=${String(options[key as keyof Intl.DateTimeFormatOptions])}`
    )
    .join(",");
  const key = `${locale ?? ""}|${shape}`;
  if (formatters.has(key)) {
    return formatters.get(key) ?? null;
  }
  let made: Intl.DateTimeFormat | null = null;
  try {
    made = new Intl.DateTimeFormat(locale, options);
  } catch {
    made = null;
  }
  formatters.set(key, made);
  return made;
};
const withCalendar = (
  locale: DateLocale,
  calendar: "gregory" | "islamic"
): string => {
  const base = (locale ?? "en").split("-u-")[0] || "en";
  return `${base}-u-ca-${calendar}-nu-latn`;
};
export const calendarParts = (
  date: Date,
  system: "gregory" | "islamic",
  locale: DateLocale
): CalendarParts => {
  if (system === "gregory") {
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  }
  try {
    const parts = formatter(withCalendar(locale, "islamic"), {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    })?.formatToParts(date);
    if (!parts) {
      throw new Error("unusable");
    }
    const read = (type: string) =>
      Number(parts.find((part) => part.type === type)?.value);
    const year = read("year");
    const month = read("month");
    const day = read("day");
    if (
      !Number.isFinite(year) ||
      !Number.isFinite(month) ||
      !Number.isFinite(day)
    ) {
      throw new TypeError("unusable");
    }
    return { day, month, year };
  } catch {
    return {
      day: date.getDate(),
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  }
};
const sameCalendarMonthParts = (a: CalendarParts, b: CalendarParts): boolean =>
  a.year === b.year && a.month === b.month;
export const startOfCalendarMonth = (
  date: Date,
  system: "gregory" | "islamic",
  locale: DateLocale
): Date => {
  if (system === "gregory") {
    return startOfMonth(date);
  }
  let cursor = startOfDay(date);
  const target = calendarParts(cursor, system, locale);
  for (let step = 0; step < 32; step += 1) {
    const previous = addDays(cursor, -1);
    if (
      !sameCalendarMonthParts(calendarParts(previous, system, locale), target)
    ) {
      return cursor;
    }
    cursor = previous;
  }
  return cursor;
};
export const monthGrid = (
  month: Date,
  weekStartsOn: number,
  system: "gregory" | "islamic" = "gregory",
  locale?: DateLocale
): Date[][] => {
  const first = startOfCalendarMonth(month, system, locale);
  const lead = (first.getDay() - normalizeWeekStart(weekStartsOn) + 7) % 7;
  const start = addDays(first, -lead);
  return Array.from({ length: 6 }, (_unusedWeek, week) =>
    Array.from({ length: 7 }, (_unusedDay, day) =>
      addDays(start, week * 7 + day)
    )
  );
};
const format = (
  date: Date,
  locale: DateLocale,
  options: Intl.DateTimeFormatOptions
): string | null => {
  try {
    return formatter(locale, options)?.format(date) ?? null;
  } catch {
    return null;
  }
};
const formatGregory = (
  date: Date,
  locale: DateLocale,
  options: Intl.DateTimeFormatOptions
): string | null =>
  format(date, withCalendar(locale, "gregory"), options) ??
  format(date, locale, {
    ...options,
    calendar: "gregory",
    numberingSystem: "latn",
  });
export type CalendarSystem = "gregory" | "islamic" | "auto";
export const resolveCalendar = (
  system: CalendarSystem,
  locale: DateLocale
): "gregory" | "islamic" => {
  if (system !== "auto") {
    return system;
  }
  try {
    const resolved = formatter(locale, {})?.resolvedOptions().calendar ?? "";
    return resolved.startsWith("islamic") ? "islamic" : "gregory";
  } catch {
    return "gregory";
  }
};
export const isSameCalendarMonth = (
  a: Date,
  b: Date,
  system: "gregory" | "islamic",
  locale: DateLocale
): boolean => {
  if (system === "gregory") {
    return isSameMonth(a, b);
  }
  const one = calendarParts(a, system, locale);
  const two = calendarParts(b, system, locale);
  return one.year === two.year && one.month === two.month;
};
export const daysInCalendarMonth = (
  date: Date,
  system: "gregory" | "islamic",
  locale: DateLocale
): number => {
  if (system === "gregory") {
    return endOfMonth(date).getDate();
  }
  const start = startOfCalendarMonth(date, system, locale);
  const parts = calendarParts(start, system, locale);
  for (let length = 28; length <= 31; length += 1) {
    if (
      !sameCalendarMonthParts(
        calendarParts(addDays(start, length), system, locale),
        parts
      )
    ) {
      return length;
    }
  }
  return 30;
};
export const addCalendarMonths = (
  date: Date,
  months: number,
  system: "gregory" | "islamic",
  locale: DateLocale
): Date => {
  if (system === "gregory") {
    return addMonths(date, months);
  }
  let cursor = startOfCalendarMonth(date, system, locale);
  for (let step = 0; step < Math.abs(months); step += 1) {
    cursor =
      months > 0
        ? addDays(cursor, daysInCalendarMonth(cursor, system, locale))
        : startOfCalendarMonth(addDays(cursor, -1), system, locale);
  }
  return cursor;
};
export const calendarDayNumber = (
  date: Date,
  system: "gregory" | "islamic",
  locale: DateLocale
): number =>
  system === "gregory"
    ? date.getDate()
    : calendarParts(date, system, locale).day;
const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
export const monthLabel = (date: Date, locale: DateLocale): string =>
  formatGregory(date, locale, { month: "long", year: "numeric" }) ??
  `${MONTHS_EN[date.getMonth()]} ${date.getFullYear()}`;
export const calendarMonthLabel = (
  date: Date,
  system: "gregory" | "islamic",
  locale: DateLocale
): string => {
  if (system === "gregory") {
    return monthLabel(date, locale);
  }
  return (
    format(date, withCalendar(locale, "islamic"), {
      month: "long",
      year: "numeric",
    }) ?? monthLabel(date, locale)
  );
};
export const monthNames = (
  locale: DateLocale,
  style: "long" | "short" = "long"
): string[] =>
  MONTHS_EN.map((fallback, month) => {
    const formatted = formatGregory(new Date(2021, month, 1), locale, {
      month: style,
    });
    return formatted ?? (style === "short" ? fallback.slice(0, 3) : fallback);
  });
export const calendarMonthNames = (
  reference: Date,
  system: "gregory" | "islamic",
  locale: DateLocale,
  style: "long" | "short" = "short"
): string[] => {
  if (system === "gregory") {
    return monthNames(locale, style);
  }
  const names: string[] = [];
  let cursor = startOfCalendarMonth(reference, system, locale);
  cursor = addCalendarMonths(
    cursor,
    -(calendarParts(cursor, system, locale).month - 1),
    system,
    locale
  );
  for (let month = 0; month < 12; month += 1) {
    names.push(
      format(cursor, withCalendar(locale, "islamic"), { month: style }) ??
        String(month + 1)
    );
    cursor = addCalendarMonths(cursor, 1, system, locale);
  }
  return names;
};
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const longDate = (date: Date, locale: DateLocale): string =>
  formatGregory(date, locale, {
    day: "numeric",
    month: "long",
    weekday: "long",
    year: "numeric",
  }) ??
  `${WEEKDAYS_EN[date.getDay()]} ${date.getDate()} ${MONTHS_EN[date.getMonth()]} ${date.getFullYear()}`;
export const calendarLongDate = (
  date: Date,
  system: "gregory" | "islamic",
  locale: DateLocale
): string => {
  if (system === "gregory") {
    return longDate(date, locale);
  }
  return (
    format(date, withCalendar(locale, "islamic"), {
      day: "numeric",
      month: "long",
      weekday: "long",
      year: "numeric",
    }) ?? longDate(date, locale)
  );
};
export const shortDate = (date: Date, locale: DateLocale): string =>
  formatGregory(date, locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }) ??
  `${date.getDate()} ${(MONTHS_EN[date.getMonth()] ?? "").slice(0, 3)} ${date.getFullYear()}`;
export const calendarShortDate = (
  date: Date,
  system: "gregory" | "islamic",
  locale: DateLocale
): string => {
  if (system === "gregory") {
    return shortDate(date, locale);
  }
  return (
    format(date, withCalendar(locale, "islamic"), {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) ?? shortDate(date, locale)
  );
};
export const weekdayNames = (
  locale: DateLocale,
  weekStartsOn: number,
  width: "short" | "narrow" = "short"
): string[] => {
  const first = normalizeWeekStart(weekStartsOn);
  return Array.from({ length: 7 }, (_unused, day) => {
    const index = (day + first) % 7;
    const formatted = formatGregory(new Date(2021, 7, 1 + index), locale, {
      weekday: width,
    });
    return (
      formatted ??
      (width === "narrow"
        ? (WEEKDAYS_EN[index] ?? "").slice(0, 1)
        : (WEEKDAYS_EN[index] ?? ""))
    );
  });
};
