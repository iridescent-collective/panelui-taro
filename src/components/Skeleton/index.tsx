import { View } from "@tarojs/components";
import { memo } from "react";
import type { CSSProperties } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";

export interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
  label?: string;
  animated?: boolean;
}

export const Skeleton = memo(
  ({ className, style, label, animated = true }: SkeletonProps) => {
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
          "rounded-[var(--panel-radius-md)] bg-[var(--panel-skeleton)]",
          animated && !reducedMotion && "panelui-skeleton-pulse",
          className
        )}
        style={{ ...style, opacity: reducedMotion ? 0.7 : 1 }}
      />
    );
  }
);
