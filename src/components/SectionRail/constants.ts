import type { SectionRailAlign } from "./types";

export const ALIGNMENT: Record<SectionRailAlign, string> = {
  bottom: "justify-end",
  center: "justify-center",
  top: "justify-start",
};
export const SPRING = { damping: 20, mass: 0.6, stiffness: 260 } as const;
export const proximityTo = (
  value: string,
  active: string | undefined,
  values: string[]
) => {
  const index = values.indexOf(value);
  const activeIndex = active === undefined ? -1 : values.indexOf(active);
  if (index === -1 || activeIndex < 0) {
    return value === active ? 1 : 0;
  }
  const distance = Math.abs(index - activeIndex);
  if (distance === 0) {
    return 1;
  }
  return distance === 1 ? 0.45 : 0;
};
