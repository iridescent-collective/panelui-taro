import { View } from "@tarojs/components";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { wedgePath } from "../../lib/chart";
import { useChartTween } from "../../primitives/chart-tween";
import { Path } from "../../primitives/static-svg";
import { wedgeContours } from "../../primitives/wedge-hit";
import { useChart } from "./context";
import type { SliceAngles } from "./math";
import type { PieChartSlicesProps } from "./types";
import { usePieGraphic } from "./use-graphic";

const SELECT_DURATION = 180;
interface SliceProps {
  index: number;
  angles: SliceAngles;
  fill: string;
  cornerRadius: number;
  popOut: number;
  dimOpacity: number;
}
const Slice = ({
  index,
  angles,
  fill,
  cornerRadius,
  popOut,
  dimOpacity,
}: SliceProps) => {
  const {
    data,
    size,
    radius,
    hole,
    reveal,
    origin,
    span,
    activeIndex,
    setActiveIndex,
    targets,
  } = useChart("PieChart slice");
  const selected = activeIndex === index;
  const reduced = usePanelReducedMotion();
  const lift = useChartTween(selected ? 1 : 0);
  useEffect(() => {
    if (reduced) {
      lift.setImmediate(selected ? 1 : 0);
    } else {
      lift.timingTo(selected ? 1 : 0, SELECT_DURATION);
    }
  }, [selected, reduced, lift.setImmediate, lift.timingTo]);
  const lifted = useSyncExternalStore(
    lift.signal.subscribe,
    lift.signal.getSnapshot,
    lift.signal.getSnapshot
  );
  const shown = useSyncExternalStore(
    reveal.subscribe,
    reveal.getSnapshot,
    reveal.getSnapshot
  );
  const centre = size / 2;
  const angle = (angles.mid - 0.25) * Math.PI * 2;
  const out = popOut * lifted;
  const shape = useMemo(
    () => ({
      corner: cornerRadius,
      cx: centre + Math.cos(angle) * out,
      cy: centre + Math.sin(angle) * out,
      from: angles.from,
      inner: hole,
      outer: radius,
      to: Math.min(angles.to, origin + span * shown),
    }),
    [
      centre,
      angle,
      out,
      radius,
      hole,
      angles.from,
      angles.to,
      origin,
      span,
      shown,
      cornerRadius,
    ]
  );
  const d = wedgePath(
    shape.cx,
    shape.cy,
    shape.outer,
    shape.inner,
    shape.from,
    shape.to,
    shape.corner
  );
  const dimmed = activeIndex >= 0 && !selected;
  const node = useMemo(
    () => <Path d={d} fill={fill} fillOpacity={dimmed ? dimOpacity : 1} />,
    [d, fill, dimmed, dimOpacity]
  );
  const { id, order } = usePieGraphic(node, index / (data.length + 1));
  const contours = useMemo(() => wedgeContours(shape), [shape]);
  useEffect(() => {
    targets.set(id, { contours, id, index, order });
    return () => {
      targets.delete(id);
    };
  }, [targets, id, index, order, contours]);
  const datum = data[index];
  return (
    <View
      aria-label={`${datum?.label ?? ""}, ${Math.round(angles.fraction * 100)} percent`}
      onClick={() => setActiveIndex(selected ? -1 : index)}
      style={{
        height: "2rpx",
        left: "-20000rpx",
        overflow: "hidden",
        position: "absolute",
        top: "0",
        width: "2rpx",
      }}
    />
  );
};
export const PieChartSlices = Object.assign(
  ({
    cornerRadius = 0,
    popOut = 6,
    dimOpacity = 0.35,
  }: PieChartSlicesProps) => {
    const { data, slices, colors, radius, status } =
      useChart("PieChart.Slices");
    if (status === "loading" || radius <= 0) {
      return null;
    }
    return (
      <>
        {slices.map((angles, index) => {
          const datum = data[index];
          if (!datum || angles.to <= angles.from) {
            return null;
          }
          return (
            <Slice
              key={datum.label}
              index={index}
              angles={angles}
              fill={colors[index] ?? colors[0]}
              cornerRadius={cornerRadius}
              popOut={popOut}
              dimOpacity={dimOpacity}
            />
          );
        })}
      </>
    );
  },
  { displayName: "PieChart.Slices", slot: "svg" as const }
);
