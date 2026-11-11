import { View } from "@tarojs/components";
import type { ComponentProps } from "react";

import { usePanelReducedMotion } from "../hooks/use-reduced-motion";
import { mergeStyle } from "../lib/styles";
import { cn } from "../lib/utils";

export const hasBlur = false;
export const useReduceTransparency = () => false;
export interface ScrimProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  blur?: boolean;
  intensity?: number;
  tint?: "light" | "dark" | "default" | "systemMaterial";
  dimClassName?: string;
  progress?: { value: number };
}
export const Scrim = ({
  blur: _blur,
  intensity: _intensity,
  tint: _tint,
  dimClassName = "bg-black/50",
  progress,
  style,
  className,
  ...props
}: ScrimProps) => {
  const reduced = usePanelReducedMotion();
  return (
    <View
      {...props}
      aria-hidden
      className={cn(
        "absolute inset-0",
        dimClassName,
        !progress && !reduced && "panelui-scrim-enter",
        className
      )}
      style={mergeStyle(
        {
          opacity: progress
            ? Math.min(1, Math.max(0, progress.value))
            : undefined,
          pointerEvents: "none",
        },
        style
      )}
    />
  );
};
