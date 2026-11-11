import { createContext, useContext, useSyncExternalStore } from "react";

import { interpolatePanelColor } from "../../lib/interpolate-color";
import type { createObservableValue } from "../../primitives/observable-value";
import type { ThemeToken } from "../../theme/types";
import { useThemeToken } from "../../theme/use-theme";
import { TIMELINE_WIDE_COLUMN } from "./geometry";
import type {
  TimelineVariant,
  TimelineTone,
  TimelineOrientation,
} from "./types";

export type TimelineScroll = ReturnType<typeof createObservableValue<number>>;
export interface TimelineContextValue {
  activeStep: number;
  variant: TimelineVariant;
  orientation: TimelineOrientation;
  scrollX: TimelineScroll;
  offsets: number[];
  animate: boolean;
  virtualized: boolean;
}
export interface TimelineItemContextValue {
  step: number;
  completed: boolean;
  tone: TimelineTone;
  showSeparator: boolean;
  offset: number;
  columnWidth: number;
}
export const TimelineContext = createContext<TimelineContextValue | null>(null);
export const TimelineItemContext =
  createContext<TimelineItemContextValue | null>(null);
export const TimelineColumnOffsetContext = createContext<number | null>(null);
export const useTimeline = (component: string) => {
  const value = useContext(TimelineContext);
  if (!value) {
    throw new Error(`${component} must be used within a <Timeline>`);
  }
  return value;
};
export const useTimelineItem = (component: string) => {
  const value = useContext(TimelineItemContext);
  if (!value) {
    throw new Error(`${component} must be used within a <Timeline.Item>`);
  }
  return value;
};
export const useScrollValue = (scroll: TimelineScroll) =>
  useSyncExternalStore(
    scroll.subscribe,
    scroll.getSnapshot,
    scroll.getSnapshot
  );
export const useTimelineToken = (token: string) =>
  useThemeToken(token.replace("--color-", "") as ThemeToken);
export const useColumnInk = (component: string) => {
  const { orientation, scrollX } = useTimeline(component);
  const item = useContext(TimelineItemContext);
  const foreground = useThemeToken("foreground");
  const muted = useThemeToken("muted-foreground");
  const scroll = useScrollValue(scrollX);
  const away = Math.min(
    1,
    Math.abs(scroll - (item?.offset ?? 0)) /
      Math.max(item?.columnWidth || TIMELINE_WIDE_COLUMN, 1)
  );
  return {
    horizontal: orientation === "horizontal",
    style: { color: interpolatePanelColor(foreground, muted, away) },
  };
};
