import { View } from "@tarojs/components";
import { useEffect, useMemo } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { Path } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import {
  DOT_REST_OPACITY,
  FRAMES,
  crossfadeAlphas,
  framePhase,
  gridPath,
  litFrames,
} from "./dot-field";
import type { ImageGenerationFieldProps } from "./types";
import { useFieldClock } from "./use-field-clock";

export const ImageGenerationField = ({
  className,
  paused = false,
  animation = "drift",
  style,
  id,
  onLayout,
  ...props
}: ImageGenerationFieldProps) => {
  const reduced = usePanelReducedMotion();
  const layoutInputs = useMemo(
    () => ({ className, style }),
    [className, style]
  );
  const measured = useElementLayout(true, layoutInputs, id, false);
  const width = measured.layout?.width ?? 0;
  const height = measured.layout?.height ?? 0;
  const clock = useFieldClock(!paused && !reduced && width > 0 && height > 0);
  const color = useThemeToken("muted-foreground");
  const grid = useMemo(() => gridPath(width, height), [width, height]);
  const frames = useMemo(
    () => litFrames(width, height, animation),
    [animation, width, height]
  );
  const phase = framePhase(clock, animation);
  const current = Math.floor(phase);
  const alpha = crossfadeAlphas(phase % 1);
  useEffect(() => {
    if (measured.layout) {
      onLayout?.(measured.layout);
    }
  }, [measured.layout, onLayout]);
  return (
    <View
      {...props}
      id={measured.id}
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={mergeStyle({}, style)}
    >
      {grid ? (
        <CanvasGraphics
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
        >
          <Path d={grid} fill={color} fillOpacity={DOT_REST_OPACITY} />
          <Path d={frames[current] ?? ""} fill={color} fillOpacity={alpha[0]} />
          <Path
            d={frames[(current + 1) % FRAMES] ?? ""}
            fill={color}
            fillOpacity={alpha[1]}
          />
        </CanvasGraphics>
      ) : null}
    </View>
  );
};
