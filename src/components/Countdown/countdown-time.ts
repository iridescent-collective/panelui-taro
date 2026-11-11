export type CountdownUnit = "days" | "hours" | "minutes" | "seconds";

export const COUNTDOWN_UNITS: readonly CountdownUnit[] = [
  "days",
  "hours",
  "minutes",
  "seconds",
];

const SECONDS: Record<CountdownUnit, number> = {
  days: 86_400,
  hours: 3600,
  minutes: 60,
  seconds: 1,
};

export interface CountdownPart {
  unit: CountdownUnit;
  value: number;
}

export const secondsLeft = (target: number, now: number): number => {
  if (!Number.isFinite(target) || !Number.isFinite(now)) {
    return 0;
  }
  return Math.max(0, Math.ceil((target - now) / 1000));
};

export const msUntilNextTick = (target: number, now: number): number => {
  const remaining = target - now;
  if (remaining <= 0) {
    return 0;
  }
  const into = remaining % 1000;
  return into === 0 ? 1000 : into;
};

export const splitSeconds = (
  total: number,
  units: readonly CountdownUnit[] = COUNTDOWN_UNITS
): CountdownPart[] => {
  const wanted = COUNTDOWN_UNITS.filter((unit) => units.includes(unit));
  if (wanted.length === 0) {
    return [];
  }
  let rest = Math.max(0, Math.floor(total));
  return wanted.map((unit) => {
    const value = Math.floor(rest / SECONDS[unit]);
    rest -= value * SECONDS[unit];
    return { unit, value };
  });
};

export const trimLeading = (
  parts: CountdownPart[],
  keep = 2
): CountdownPart[] => {
  let start = 0;
  while (start < parts.length - keep && parts[start]?.value === 0) {
    start += 1;
  }
  return parts.slice(start);
};

const NAMES: Record<CountdownUnit, [string, string]> = {
  days: ["day", "days"],
  hours: ["hour", "hours"],
  minutes: ["minute", "minutes"],
  seconds: ["second", "seconds"],
};

export const describeSeconds = (total: number): string => {
  if (total <= 0) {
    return "Time is up";
  }
  if (total < 60) {
    return `${total} ${NAMES.seconds[total === 1 ? 0 : 1]} left`;
  }
  const parts = splitSeconds(total, ["days", "hours", "minutes"])
    .filter((part) => part.value > 0)
    .map(
      (part) => `${part.value} ${NAMES[part.unit][part.value === 1 ? 0 : 1]}`
    );
  return `${parts.join(", ")} left`;
};
