import { PlannerGrid, PlannerDay } from "./grid";
import {
  PlannerHeader,
  PlannerTitle,
  PlannerToday,
  PlannerNav,
  PlannerAction,
  PlannerLegend,
  PlannerSummary,
  PlannerFooter,
  PlannerDetails,
} from "./parts";
import { PlannerRoot } from "./root";
import { PlannerScroller } from "./scroller";

export type {
  PlannerVariant,
  PlannerEntry,
  PlannerCategory,
  PlannerProps,
  PlannerHeaderProps,
  PlannerTitleProps,
  PlannerTodayProps,
  PlannerNavProps,
  PlannerActionProps,
  PlannerDayState,
  PlannerDayRenderer,
  PlannerGridProps,
  PlannerDayProps,
  PlannerLegendProps,
  PlannerSummaryProps,
  PlannerFooterProps,
  PlannerDetailsProps,
  PlannerScrollerProps,
} from "./types";
export type { PlannerCountedCategory } from "./planner-entries";
export const Planner = Object.assign(PlannerRoot, {
  Action: PlannerAction,
  Day: PlannerDay,
  Details: PlannerDetails,
  Footer: PlannerFooter,
  Grid: PlannerGrid,
  Header: PlannerHeader,
  Legend: PlannerLegend,
  Nav: PlannerNav,
  Scroller: PlannerScroller,
  Summary: PlannerSummary,
  Title: PlannerTitle,
  Today: PlannerToday,
});
