import { useMemo, useSyncExternalStore } from "react";

import { G, Path } from "../../primitives/static-svg";
import { useChart, useChartDomain } from "../LineChart/context";
import { useChartGraphic } from "../LineChart/use-graphic";
import { waterfallBarPath } from "./math";
import { useWaterfallSettings } from "./root";
import type { WaterfallChartBarsProps, WaterfallKind } from "./types";

export const WaterfallChartBars = Object.assign(
  ({ cornerRadius }: WaterfallChartBarsProps) => {
    const {
      plot,
      status,
      reveal,
      activeIndexJS: active,
    } = useChart("WaterfallChart.Bars");
    const settings = useWaterfallSettings();
    const [min, max] = useChartDomain();
    const grow = useSyncExternalStore(
      reveal.subscribe,
      reveal.getSnapshot,
      reveal.getSnapshot
    );
    const options = {
      ...settings,
      active,
      grow,
      horizontal: settings.orientation === "horizontal",
      loading: status === "loading",
      max,
      min,
      plot,
      radius: cornerRadius ?? settings.cornerRadius,
    };
    const node = useMemo(
      () => (
        <G>
          {(["rise", "fall", "total"] as WaterfallKind[]).map((kind) => {
            const rest = waterfallBarPath(options, kind, false);
            const chosen = waterfallBarPath(options, kind, true);
            return (
              <G key={kind}>
                <Path
                  d={rest.d}
                  opacity={rest.opacity}
                  fill={settings.colors[kind]}
                />
                <Path
                  d={chosen.d}
                  opacity={chosen.opacity}
                  fill={settings.colors[kind]}
                />
              </G>
            );
          })}
        </G>
      ),
      [settings, plot, min, max, grow, active, cornerRadius, status]
    );
    useChartGraphic("grid", node);
    return null;
  },
  { displayName: "WaterfallChart.Bars", layer: "svg" as const }
);
