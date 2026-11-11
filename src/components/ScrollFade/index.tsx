import type { ScrollView } from "@tarojs/components";
import { Children, isValidElement } from "react";
import type { ComponentProps, ReactElement } from "react";

import { cn } from "../../lib/utils";
import { ScrollProgress } from "../../primitives/scroll-progress";
import { useThemeToken } from "../../theme/use-theme";
import { FadeEdges } from "./edge";
import type { ScrollFadeProps } from "./types";

export type { ScrollFadeProps } from "./types";
export const ScrollFade = ({
  className,
  size = 48,
  edges = "both",
  orientation,
  color,
  fadeInDistance = 24,
  enabled = true,
  children,
  ...props
}: ScrollFadeProps) => {
  const themeBackground = useThemeToken("background");
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
          <FadeEdges
            color={color ?? themeBackground}
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
