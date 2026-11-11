import { View } from "@tarojs/components";

import { useScrollEdgeOpacities } from "../../hooks/use-scroll-edge-opacities";
import { withColorAlpha } from "../../lib/color";
import { scrollEdgePosition } from "../../primitives/scroll-edge-position";

export const FadeEdges = ({
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
    const ink = withColorAlpha(color, 1);
    const clear = withColorAlpha(color, 0);
    const stops = isStart ? `${ink},${clear}` : `${clear},${ink}`;
    return (
      <View
        key={edge}
        aria-hidden
        data-fade-edge={edge}
        className={`panelui-scroll-fade-${edge} pointer-events-none absolute`}
        style={{
          ...scrollEdgePosition(size, horizontal, isStart),
          backgroundImage: `linear-gradient(to ${horizontal ? "right" : "bottom"},${stops})`,
          opacity: isStart ? start : end,
        }}
      />
    );
  });
};
