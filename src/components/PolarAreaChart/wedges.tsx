import { View } from "@tarojs/components";
import { useEffect, useMemo, useSyncExternalStore } from "react";

import { compactNumber, wedgePath } from "../../lib/chart";
import { Path } from "../../primitives/static-svg";
import { wedgeContours } from "../../primitives/wedge-hit";
import { useChart } from "./context";
import type { WedgeGeometry } from "./math";
import type { PolarAreaChartWedgesProps } from "./types";
import { usePolarGraphic } from "./use-graphic";

interface WedgeProps {
  index: number;
  wedge: WedgeGeometry;
  fill: string;
  cornerRadius: number;
  dimOpacity: number;
}
const Wedge = ({
  index,
  wedge,
  fill,
  cornerRadius,
  dimOpacity,
}: WedgeProps) => {
  const { data, size, reveal, activeIndex, setActiveIndex, targets } = useChart(
    "PolarAreaChart wedge"
  );
  const shown = useSyncExternalStore(
    reveal.subscribe,
    reveal.getSnapshot,
    reveal.getSnapshot
  );
  const shape = useMemo(
    () => ({
      corner: cornerRadius,
      cx: size / 2,
      cy: size / 2,
      from: wedge.from,
      inner: 0,
      outer: wedge.radius * shown,
      to: wedge.to,
    }),
    [cornerRadius, size, wedge.from, wedge.to, wedge.radius, shown]
  );
  const d = wedgePath(
    shape.cx,
    shape.cy,
    shape.outer,
    0,
    shape.from,
    shape.to,
    shape.corner
  );
  const dimmed = activeIndex >= 0 && activeIndex !== index;
  const node = useMemo(
    () => <Path d={d} fill={fill} fillOpacity={dimmed ? dimOpacity : 1} />,
    [d, fill, dimmed, dimOpacity]
  );
  const { id, order } = usePolarGraphic(node, index / (data.length + 1));
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
      aria-label={`${datum?.label ?? ""}, ${compactNumber(datum?.value ?? 0)}`}
      onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
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
export const PolarAreaChartWedges = Object.assign(
  ({ cornerRadius = 0, dimOpacity = 0.35 }: PolarAreaChartWedgesProps) => {
    const { data, wedges, colors, status } = useChart("PolarAreaChart.Wedges");
    if (status === "loading" || !wedges.length) {
      return null;
    }
    return (
      <>
        {wedges.map((wedge, index) => {
          const datum = data[index];
          if (!datum || wedge.radius <= 0 || wedge.to <= wedge.from) {
            return null;
          }
          return (
            <Wedge
              key={`${datum.label}-${index}`}
              index={index}
              wedge={wedge}
              fill={colors[index] ?? colors[0]}
              cornerRadius={cornerRadius}
              dimOpacity={dimOpacity}
            />
          );
        })}
      </>
    );
  },
  { displayName: "PolarAreaChart.Wedges", slot: "svg" as const }
);
