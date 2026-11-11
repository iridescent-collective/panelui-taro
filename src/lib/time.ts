export interface TimeValue {
  hour: number;
  minute: number;
}
export type HourCycle = 12 | 24;
const MINUTES_PER_DAY = 24 * 60;
export const timeToMinutes = (value: TimeValue): number =>
  value.hour * 60 + value.minute;
export const minutesToTime = (minutes: number): TimeValue => {
  const wrapped =
    ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return { hour: Math.floor(wrapped / 60), minute: wrapped % 60 };
};
export const compareTime = (a: TimeValue, b: TimeValue): number =>
  timeToMinutes(a) - timeToMinutes(b);
export const isSameTime = (
  a: TimeValue | null | undefined,
  b: TimeValue | null | undefined
): boolean => {
  if (!a || !b) {
    return false;
  }
  return a.hour === b.hour && a.minute === b.minute;
};
export const clampTime = (
  value: TimeValue,
  min?: TimeValue,
  max?: TimeValue
): TimeValue => {
  let minutes = timeToMinutes(value);
  if (min) {
    minutes = Math.max(minutes, timeToMinutes(min));
  }
  if (max) {
    minutes = Math.min(minutes, timeToMinutes(max));
  }
  return minutesToTime(minutes);
};
export const isTimeInRange = (
  value: TimeValue,
  min?: TimeValue,
  max?: TimeValue
): boolean => {
  const minutes = timeToMinutes(value);
  if (min && minutes < timeToMinutes(min)) {
    return false;
  }
  if (max && minutes > timeToMinutes(max)) {
    return false;
  }
  return true;
};
export const roundToStep = (value: TimeValue, step: number): TimeValue => {
  if (step <= 1) {
    return minutesToTime(timeToMinutes(value));
  }
  return minutesToTime(Math.round(timeToMinutes(value) / step) * step);
};
export const timesOfDay = (step: number): TimeValue[] => {
  const safe = Math.max(1, Math.floor(step));
  const out: TimeValue[] = [];
  for (let minutes = 0; minutes < MINUTES_PER_DAY; minutes += safe) {
    out.push(minutesToTime(minutes));
  }
  return out;
};
export const displayHour = (hour: number, hourCycle: HourCycle): number => {
  if (hourCycle === 24) {
    return hour;
  }
  const twelve = hour % 12;
  return twelve === 0 ? 12 : twelve;
};
export const hourFromDisplay = (
  displayed: number,
  meridiem: "am" | "pm",
  hourCycle: HourCycle
): number => {
  if (hourCycle === 24) {
    return displayed;
  }
  const base = displayed % 12;
  return meridiem === "pm" ? base + 12 : base;
};
export const meridiemOf = (hour: number): "am" | "pm" =>
  hour < 12 ? "am" : "pm";
export const meridiemLabels = (locale?: string): [string, string] => {
  const format = (hour: number) => {
    try {
      const parts = new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        hour12: true,
      }).formatToParts(new Date(2020, 0, 1, hour));
      return parts.find((part) => part.type === "dayPeriod")?.value;
    } catch {
      return null;
    }
  };
  return [format(9) ?? "AM", format(21) ?? "PM"];
};
export const padTwo = (value: number): string =>
  value < 10 ? `0${value}` : String(value);
export interface FormatTimeOptions {
  hourCycle?: HourCycle;
  locale?: string;
}
export const formatTime = (
  value: TimeValue,
  { hourCycle = 12, locale }: FormatTimeOptions = {}
): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      hour12: hourCycle === 12,
      minute: "2-digit",
    }).format(new Date(2020, 0, 1, value.hour, value.minute));
  } catch {
    if (hourCycle === 24) {
      return `${padTwo(value.hour)}:${padTwo(value.minute)}`;
    }
    const [am, pm] = meridiemLabels(locale);
    const suffix = value.hour < 12 ? am : pm;
    return `${displayHour(value.hour, 12)}:${padTwo(value.minute)} ${suffix}`;
  }
};
export const timeFromDate = (date: Date): TimeValue => ({
  hour: date.getHours(),
  minute: date.getMinutes(),
});
export const timeToDate = (value: TimeValue, day: Date = new Date()): Date => {
  const copy = new Date(day);
  copy.setHours(value.hour, value.minute, 0, 0);
  return copy;
};
