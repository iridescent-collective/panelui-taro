import {
  useContext,
  useEffect,
  useId,
  useMemo,
  useSyncExternalStore,
} from "react";

import { wedgePath } from "../../lib/chart";
import { Circle, ClipPath, Defs, G, Path } from "../../primitives/static-svg";
import { useSeriesColor } from "../../theme/use-series-color";
import { RingOrderContext, useChart } from "./context";
import { ringGeometry } from "./math";
import type { RingChartRingProps } from "./types";

export const RingChartRing = Object.assign(
  ({
    index,
    color,
    colorIndex,
    lineCap,
    trackOpacity = 0.15,
    segments,
    segmentGap = 3,
  }: RingChartRingProps) => {
    const {
      data,
      size,
      strokeWidth,
      ringGap,
      colors,
      reveal,
      activeIndex,
      startAngle,
      arc,
      graphics,
      targets,
    } = useChart("RingChart.Ring");
    const token = useSeriesColor(undefined, colorIndex ?? 1);
    const datum = data[index];
    const stroke =
      color ?? datum?.color ?? (colorIndex ? token : colors[index]) ?? token;
    const shown = useSyncExternalStore(
      reveal.subscribe,
      reveal.getSnapshot,
      reveal.getSnapshot
    );
    const { radius, cap, trackDash, progressDash } = ringGeometry({
      arc,
      count: data.length,
      datum,
      index,
      lineCap,
      reveal: shown,
      ringGap,
      segmentGap,
      segments,
      size,
      strokeWidth,
    });
    const centre = size / 2;
    const rotate = `rotate(${startAngle - 90} ${centre} ${centre})`;
    const id = useId();
    const clipId = `panelui-ring-clip-${id.replaceAll(":", "")}`;
    const clipped = Number.isFinite(segments) && (segments ?? 0) > 0 && arc < 1;
    const clip = clipped
      ? wedgePath(
          centre,
          centre,
          centre + Math.max(0, strokeWidth),
          0,
          startAngle / 360,
          startAngle / 360 + arc,
          0
        )
      : "";
    const order = useContext(RingOrderContext);
    const trackPattern = trackDash.join(",");
    const progressPattern = progressDash.join(",");
    const node = useMemo(
      () =>
        datum && radius > 0 ? (
          <>
            {clipped ? (
              <Defs>
                <ClipPath id={clipId}>
                  <Path d={clip} />
                </ClipPath>
              </Defs>
            ) : null}
            <G
              opacity={activeIndex >= 0 && activeIndex !== index ? 0.35 : 1}
              {...(clipped ? { clipPath: `url(#${clipId})` } : {})}
            >
              <Circle
                cx={centre}
                cy={centre}
                r={radius}
                stroke={stroke}
                strokeOpacity={trackOpacity}
                strokeWidth={strokeWidth}
                strokeLinecap={cap}
                strokeDasharray={trackPattern}
                fill="none"
                transform={rotate}
              />
              <Circle
                cx={centre}
                cy={centre}
                r={radius}
                stroke={stroke}
                strokeWidth={strokeWidth}
                strokeLinecap={cap}
                strokeDasharray={progressPattern}
                fill="none"
                transform={rotate}
              />
            </G>
          </>
        ) : null,
      [
        datum,
        radius,
        activeIndex,
        index,
        centre,
        stroke,
        trackOpacity,
        strokeWidth,
        cap,
        trackPattern,
        progressPattern,
        rotate,
        clipped,
        clip,
        clipId,
      ]
    );
    useEffect(() => {
      graphics.set({ id, layer: "grid", node, order });
    }, [graphics, id, node, order]);
    useEffect(() => {
      if (datum && radius > 0) {
        targets.set(id, { id, index, order, radius });
      } else {
        targets.delete(id);
      }
      return () => {
        targets.delete(id);
      };
    }, [targets, id, index, order, radius, datum]);
    useEffect(() => () => graphics.remove(id), [graphics, id]);
    return null;
  },
  { displayName: "RingChart.Ring", slot: "ring" as const }
);
