import { View } from "@tarojs/components";
import { memo } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { SPINNER_SIZE } from "./constants";

export interface SpinnerProps {
  size?: keyof typeof SPINNER_SIZE;
  className?: string;
  label?: string;
  color?: string;
  trackColor?: string;
}

export const Spinner = memo(
  ({ size = "md", className, label, color, trackColor }: SpinnerProps) => {
    const announced = label !== undefined && label !== null;
    const reducedMotion = usePanelReducedMotion();
    return (
      <View
        role={announced ? "progressbar" : undefined}
        aria-role={announced ? "progressbar" : undefined}
        aria-label={label}
        aria-busy={announced}
        aria-hidden={!announced}
        className={cn(
          "shrink-0 rounded-full border-solid border-[var(--panel-muted)] border-t-[var(--panel-primary)]",
          SPINNER_SIZE[size],
          reducedMotion ? "panelui-pulse" : "panelui-spin",
          className
        )}
        style={{ borderColor: trackColor, borderTopColor: color }}
      />
    );
  }
);
