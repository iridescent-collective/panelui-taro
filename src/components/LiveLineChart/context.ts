import {
  createContext,
  useContext,
  useEffect,
  useId,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import type { Plot, ChartCurve } from "../../lib/chart";
import type { ChartGraphicsStore } from "../../primitives/chart-graphics-store";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { ObservableValue } from "../../primitives/observable-value";
import type {
  LiveLinePoint,
  LiveLineChartStatus,
  LiveLineMomentum,
} from "./types";

export interface LiveContextValue {
  data: LiveLinePoint[];
  plot: Plot;
  status: LiveLineChartStatus;
  curve: ChartCurve;
  now: ObservableNumber;
  windowMs: number;
  domains: ObservableValue<readonly number[]>;
  extent: [number, number];
  activePoint: LiveLinePoint | null;
  setActivePoint: (point: LiveLinePoint | null) => void;
  latest: LiveLinePoint | null;
  momentum: LiveLineMomentum;
  color: string;
  clipId: string;
  graphics: ChartGraphicsStore;
  width: number;
  height: number;
}
export const LiveLineChartContext = createContext<LiveContextValue | null>(
  null
);
export const useChart = (part: string) => {
  const context = useContext(LiveLineChartContext);
  if (!context) {
    throw new Error(`${part} must be used within a <LiveLineChart>`);
  }
  return context;
};
export const useLiveLineChart = () => {
  const { activePoint, latest, momentum, color } = useChart("useLiveLineChart");
  return { activePoint, color, latest, momentum };
};
export const useLiveFrame = () => {
  const { now, domains } = useChart("LiveLineChart frame");
  return {
    extent: useSyncExternalStore(
      domains.subscribe,
      domains.getSnapshot,
      domains.getSnapshot
    ),
    time: useSyncExternalStore(now.subscribe, now.getSnapshot, now.getSnapshot),
  };
};
export const useLiveGraphic = (node: ReactNode) => {
  const { graphics } = useChart("LiveLineChart geometry");
  const id = useId();
  useEffect(() => {
    graphics.set({ id, layer: "grid", node, order: 0 });
  }, [graphics, id, node]);
  useEffect(() => () => graphics.remove(id), [graphics, id]);
};
