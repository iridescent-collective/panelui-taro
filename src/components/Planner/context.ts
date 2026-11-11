import { createContext, useContext } from "react";

import type { DateLocale } from "../../lib/date";
import type { PlannerCountedCategory } from "./planner-entries";
import type {
  PlannerVariant,
  PlannerEntry,
  PlannerCategory,
  PlannerDayRenderer,
} from "./types";

export interface PlannerContextValue {
  month: Date;
  setMonth: (month: Date) => void;
  syncMonth: (month: Date) => void;
  today: Date;
  selected: Date | null;
  select: (date: Date | null) => void;
  days: Map<number, PlannerEntry[]>;
  categories: PlannerCategory[];
  categoryLabels: Map<string, string>;
  colorOf: (category: string | undefined) => string | undefined;
  summary: {
    total: number;
    categories: PlannerCountedCategory[];
  };
  entryLimit: number;
  variant: PlannerVariant;
  fill: boolean;
  weekStartsOn: number;
  grid: Date[][];
  locale: DateLocale;
  system: "gregory" | "islamic";
  isInMonth: (date: Date) => boolean;
  renderDay?: PlannerDayRenderer;
  onDayPress?: (date: Date, entries: PlannerEntry[]) => void;
}
export const PlannerContext = createContext<PlannerContextValue | null>(null);
export const usePlanner = (component: string): PlannerContextValue => {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Planner>`);
  }
  return context;
};
