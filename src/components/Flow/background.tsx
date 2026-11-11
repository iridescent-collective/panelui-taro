import { View } from "@tarojs/components";
import { useId, useSyncExternalStore } from "react";

import {
  StaticSvg,
  Defs,
  Pattern,
  Rect,
  Path,
  Circle,
} from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { useFlow } from "./context";
import type { FlowBackgroundProps } from "./types";

export const FlowBackground = ({
  variant = "dots",
  gap = 24,
  size = 1.6,
  color,
}: FlowBackgroundProps) => {
  const { box, layer, translateX, translateY, zoom } =
    useFlow("Flow.Background");
  const x = useSyncExternalStore(
    translateX.subscribe,
    translateX.getSnapshot,
    translateX.getSnapshot
  );
  const y = useSyncExternalStore(
    translateY.subscribe,
    translateY.getSnapshot,
    translateY.getSnapshot
  );
  const scale = useSyncExternalStore(
    zoom.subscribe,
    zoom.getSnapshot,
    zoom.getSnapshot
  );
  const token = useThemeToken("muted-foreground");
  const tint = color ?? token;
  const id = `panel-flow-pattern-${useId().replaceAll(":", "")}`;
  if (variant === "none" || box.width <= 0 || box.height <= 0) {
    return null;
  }
  // Like Native, move a fixed tile by whole cells inside the camera layer.
  // The SVG source stays unchanged while panning or zooming.
  const step = gap;
  const mark = size;
  const followX = Math.round((-x + box.width / 2) / scale / gap) * gap;
  const followY = Math.round((-y + box.height / 2) / scale / gap) * gap;
  return (
    <View
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        transform: `translateX(${followX * 2}rpx) translateY(${followY * 2}rpx)`,
      }}
    >
      <StaticSvg
        width={layer.width}
        height={layer.height}
        viewBox={`0 0 ${layer.width} ${layer.height}`}
      >
        <Defs>
          <Pattern
            id={id}
            x={0}
            y={0}
            width={step}
            height={step}
            patternUnits="userSpaceOnUse"
          >
            {variant === "dots" ? (
              <Circle
                cx={step / 2}
                cy={step / 2}
                r={mark}
                fill={tint}
                opacity={0.5}
              />
            ) : null}
            {variant === "lines" ? (
              <Path
                d={`M0,0 L${step},0 M0,0 L0,${step}`}
                stroke={tint}
                strokeWidth={Math.max(size / 2, 0.4)}
                opacity={0.3}
              />
            ) : null}
            {variant === "cross" ? (
              <Path
                d={`M${step / 2 - mark * 2},${step / 2} L${step / 2 + mark * 2},${step / 2} M${step / 2},${step / 2 - mark * 2} L${step / 2},${step / 2 + mark * 2}`}
                stroke={tint}
                strokeWidth={Math.max(size / 2, 0.4)}
                opacity={0.42}
              />
            ) : null}
          </Pattern>
        </Defs>
        <Rect
          x={0}
          y={0}
          width={layer.width}
          height={layer.height}
          fill={`url(#${id})`}
        />
      </StaticSvg>
    </View>
  );
};
FlowBackground.slot = "background" as const;
