import { useMemo, useSyncExternalStore } from "react";

import { Path } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useChart, useChartDomain } from "../LineChart/context";
import { useChartGraphic } from "../LineChart/use-graphic";
import { waterfallConnectorPath } from "./math";
import { useWaterfallSettings } from "./root";
import type { WaterfallChartConnectorsProps } from "./types";

export const WaterfallChartConnectors = Object.assign(
  ({
    color,
    dashArray = "3,4",
    strokeWidth = 1,
    opacity = 1,
  }: WaterfallChartConnectorsProps) => {
    const { plot, status, reveal } = useChart("WaterfallChart.Connectors");
    const settings = useWaterfallSettings();
    const [min, max] = useChartDomain();
    const grow = useSyncExternalStore(
      reveal.subscribe,
      reveal.getSnapshot,
      reveal.getSnapshot
    );
    const token = useThemeToken("muted-foreground");
    const { d } = waterfallConnectorPath({
      ...settings,
      active: -1,
      grow,
      horizontal: settings.orientation === "horizontal",
      loading: status === "loading",
      max,
      min,
      plot,
      radius: settings.cornerRadius,
    });
    const node = useMemo(
      () =>
        settings.steps.length < 2 ? null : (
          <Path
            d={d}
            stroke={color ?? token}
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            strokeOpacity={opacity}
            fill="none"
          />
        ),
      [settings.steps.length, d, color, token, strokeWidth, dashArray, opacity]
    );
    useChartGraphic("grid", node);
    return null;
  },
  { displayName: "WaterfallChart.Connectors", layer: "svg" as const }
);
