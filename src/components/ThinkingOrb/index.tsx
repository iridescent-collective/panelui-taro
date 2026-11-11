import { Canvas, View } from "@tarojs/components";
import { useId } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { GraphicSnapshot } from "../../primitives/canvas-graphics";
import { Path } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { PROFILES, STATE_LABEL } from "./constants";
import { renderFrame } from "./geometry";
import type { ThinkingOrbProps } from "./types";
import {
  normalizeOrbSize,
  normalizeOrbSpeed,
  useOrbCanvas,
} from "./use-canvas";

export type { ThinkingOrbProps, ThinkingOrbState } from "./types";
export const ThinkingOrb = ({
  className,
  state = "working",
  size: sizeProp = 64,
  speed: speedProp = 1,
  paused = false,
  color,
  accessibilityLabel,
  style,
  id,
  ...props
}: ThinkingOrbProps) => {
  const reduced = usePanelReducedMotion();
  const foreground = useThemeToken("foreground");
  const ink = color ?? foreground;
  const size = normalizeOrbSize(sizeProp);
  const speed = normalizeOrbSpeed(speedProp);
  const generated = `panelui-orb-${useId().replaceAll(":", "")}`;
  const anchor = id ?? generated;
  const canvasId = `${anchor}-canvas`;
  const drawing = useOrbCanvas(
    canvasId,
    {
      ink,
      paused,
      reduced,
      size,
      speed,
      state,
    },
    anchor
  );
  const profile = PROFILES[state][size <= 32 ? "sm" : "md"];
  const paths =
    drawing.fallback && size > 0
      ? renderFrame(state, size, drawing.time, profile)
      : [];
  return (
    <View
      {...props}
      id={anchor}
      role="img"
      aria-role="image"
      aria-label={accessibilityLabel ?? STATE_LABEL[state]}
      className={cn("relative flex items-center justify-center", className)}
      style={mergeStyle(
        { height: `${size * 2}rpx`, width: `${size * 2}rpx` },
        style
      )}
    >
      {!drawing.scrolling ? (
        <Canvas
          id={canvasId}
          type="2d"
          aria-hidden
          style={{
            height: `${size * 2}rpx`,
            opacity: drawing.fallback ? 0 : 1,
            pointerEvents: "none",
            width: `${size * 2}rpx`,
          }}
        />
      ) : null}
      {drawing.fallback && size > 0 ? (
        <View
          aria-hidden
          style={{ inset: 0, pointerEvents: "none", position: "absolute" }}
        >
          <GraphicSnapshot
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
          >
            {paths.map((path, index) => (
              <Path
                key={index}
                d={path}
                fill={ink}
                fillOpacity={(index + 0.5) / 8}
              />
            ))}
          </GraphicSnapshot>
        </View>
      ) : null}
    </View>
  );
};
ThinkingOrb.displayName = "ThinkingOrb";
