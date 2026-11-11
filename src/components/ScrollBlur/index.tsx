import type { ScrollView } from "@tarojs/components";
import { Children, isValidElement } from "react";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../lib/utils";
import { ScrollProgress } from "../../primitives/scroll-progress";
import { useThemeToken } from "../../theme/use-theme";
import { BlurEdges } from "./edge";
import type { ScrollBlurProps } from "./types";

export type { ScrollBlurProps, ScrollBlurTint } from "./types";
export const ScrollBlur = ({
  className,
  size = 80,
  edges = "both",
  orientation,
  layers: _layers = 8,
  intensity: _intensity = 56,
  material: _material = "default",
  tint: _tint = 0.95,
  color,
  fadeInDistance = 24,
  enabled = true,
  children,
  ...props
}: ScrollBlurProps) => {
  const background = useThemeToken("background");
  const child = Children.only(children) as ReactElement<
    ComponentProps<typeof ScrollView> & { horizontal?: boolean }
  >;
  const horizontal =
    orientation === undefined
      ? isValidElement(child) &&
        !!(child.props.scrollX || child.props.horizontal)
      : orientation === "horizontal";
  return (
    <ScrollProgress
      {...props}
      className={cn("relative", className)}
      orientation={horizontal ? "horizontal" : "vertical"}
      overlay={
        enabled && edges !== "none" ? (
          <BlurEdges
            color={color ?? background}
            size={size}
            horizontal={horizontal}
            distance={fadeInDistance}
            edges={edges}
          />
        ) : null
      }
    >
      {child}
    </ScrollProgress>
  );
};
