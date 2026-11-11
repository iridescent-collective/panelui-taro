import { View } from "@tarojs/components";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useChartTween } from "../../primitives/chart-tween";
import { Path } from "../../primitives/static-svg";
import {
  FUNNEL_RING_INSET,
  FUNNEL_RING_FAINTEST,
  FUNNEL_RING_STRONGEST,
  FUNNEL_SELECT_SPREAD,
  FUNNEL_SELECT_DURATION,
} from "./constants";
import { useChart } from "./context";
import { funnelContains, funnelReach } from "./math";
import { ribbonPath } from "./ribbon";
import type { FunnelChartStagesProps } from "./types";
import { useFunnelGraphic } from "./use-graphic";

const Stage = ({
  index,
  dimOpacity,
}: {
  index: number;
  dimOpacity: number;
}) => {
  const {
    data,
    bands,
    middle,
    curve,
    layers,
    colors,
    strengths,
    reveal,
    windows,
    activeIndex,
    setActiveIndex,
    targets,
  } = useChart("FunnelChart stage");
  const reduced = usePanelReducedMotion();
  const dimmed = activeIndex >= 0 && activeIndex !== index;
  const selected = activeIndex === index;
  const dim = useChartTween(dimmed ? 1 : 0);
  const spread = useChartTween(selected ? 1 : 0);
  useEffect(() => {
    if (reduced) {
      dim.setImmediate(dimmed ? 1 : 0);
      spread.setImmediate(selected ? 1 : 0);
    } else {
      dim.timingTo(dimmed ? 1 : 0, FUNNEL_SELECT_DURATION);
      spread.timingTo(selected ? 1 : 0, FUNNEL_SELECT_DURATION);
    }
  }, [
    reduced,
    dimmed,
    selected,
    dim.setImmediate,
    dim.timingTo,
    spread.setImmediate,
    spread.timingTo,
  ]);
  const shown = useSyncExternalStore(
    reveal.subscribe,
    reveal.getSnapshot,
    reveal.getSnapshot
  );
  const fade = useSyncExternalStore(
    dim.signal.subscribe,
    dim.signal.getSnapshot,
    dim.signal.getSnapshot
  );
  const swell = useSyncExternalStore(
    spread.signal.subscribe,
    spread.signal.getSnapshot,
    spread.signal.getSnapshot
  );
  const band = bands[index];
  const window = windows[index];
  const progress = funnelReach(shown, window);
  const node = useMemo(
    () => (
      <>
        {Array.from({ length: layers }, (_, ring) => {
          const ratio = ring / Math.max(layers - 1, 1);
          const reach =
            (1 - (ring / layers) * FUNNEL_RING_INSET) *
            progress *
            (1 + swell * ratio * FUNNEL_SELECT_SPREAD);
          return (
            <Path
              key={ring}
              d={ribbonPath(
                band.offset,
                band.length,
                band.head * reach,
                band.tail * reach,
                middle,
                curve
              )}
              fill={colors[index]}
              fillOpacity={
                (strengths[index] ?? 1) *
                (FUNNEL_RING_FAINTEST +
                  ratio * (FUNNEL_RING_STRONGEST - FUNNEL_RING_FAINTEST)) *
                (1 - fade * (1 - dimOpacity))
              }
            />
          );
        })}
      </>
    ),
    [
      layers,
      progress,
      swell,
      band,
      middle,
      curve,
      colors,
      index,
      strengths,
      fade,
      dimOpacity,
    ]
  );
  const { id, order } = useFunnelGraphic(node, index / (data.length + 1));
  useEffect(() => {
    const reaches = Array.from(
      { length: layers },
      (_, ring) =>
        (1 - (ring / layers) * FUNNEL_RING_INSET) *
        progress *
        (1 + swell * (ring / Math.max(layers - 1, 1)) * FUNNEL_SELECT_SPREAD)
    );
    targets.set(id, {
      hit: (x, y) =>
        funnelContains(band, middle, curve, Math.max(...reaches), x, y),
      id,
      index,
      order,
    });
    return () => {
      targets.delete(id);
    };
  }, [targets, id, index, order, layers, progress, swell, band, middle, curve]);
  return (
    <View
      aria-label={`${data[index].label}, ${data[index].value}`}
      onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
      style={{
        height: "2rpx",
        left: "-20000rpx",
        overflow: "hidden",
        position: "absolute",
        width: "2rpx",
      }}
    />
  );
};
export const FunnelChartStages = Object.assign(
  ({ dimOpacity = 0.3 }: FunnelChartStagesProps) => {
    const { data, bands, status } = useChart("FunnelChart.Stages");
    return status === "loading" ? null : (
      <>
        {bands.map((band, index) =>
          (band.head > 0 || band.tail > 0) && data[index] ? (
            <Stage
              key={`${data[index].label}-${index}`}
              index={index}
              dimOpacity={dimOpacity}
            />
          ) : null
        )}
      </>
    );
  },
  { displayName: "FunnelChart.Stages", slot: "svg" as const }
);
