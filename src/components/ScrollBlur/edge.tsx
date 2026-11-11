import { View } from "@tarojs/components";

import { useScrollEdgeOpacities } from "../../hooks/use-scroll-edge-opacities";
import { withColorAlpha } from "../../lib/color";
import { scrollEdgePosition } from "../../primitives/scroll-edge-position";

export const BlurEdges = ({
  color,
  size,
  horizontal,
  distance,
  edges,
}: {
  color: string;
  size: number;
  horizontal: boolean;
  distance: number;
  edges: "both" | "start" | "end";
}) => {
  const { start, end } = useScrollEdgeOpacities(distance);
  const positions = edges === "both" ? (["start", "end"] as const) : [edges];
  return positions.map((edge) => {
    const isStart = edge === "start";
    const full = withColorAlpha(color, 1);
    const middle = withColorAlpha(color, 0.36);
    const clear = withColorAlpha(color, 0);
    const stops = isStart
      ? `${full} 0%, ${middle} 55%, ${clear} 100%`
      : `${clear} 0%, ${middle} 45%, ${full} 100%`;
    return (
      <View
        key={edge}
        aria-hidden
        data-blur-edge={edge}
        className={`panelui-scroll-blur-${edge} pointer-events-none absolute overflow-hidden`}
        style={{
          ...scrollEdgePosition(size, horizontal, isStart),
          backgroundImage: `linear-gradient(to ${horizontal ? "right" : "bottom"},${stops})`,
          opacity: isStart ? start : end,
        }}
      />
    );
  });
};
