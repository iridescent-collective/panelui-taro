import { Children } from "react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { useTooltip } from "./context";
import type { TooltipTitleProps, TooltipDescriptionProps } from "./types";
import { tooltipVariants } from "./variants";

export const TooltipText = ({ className, ...props }: TextProps) => {
  const { variant } = useTooltip("Tooltip.Text");
  return (
    <Text
      {...props}
      className={cn(tooltipVariants({ variant }).text(), className)}
    />
  );
};
export const wrapTooltipText = (children: ReactNode) =>
  Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number" ? (
      <TooltipText>{child}</TooltipText>
    ) : (
      child
    )
  );
export const TooltipTitle = ({ className, ...props }: TooltipTitleProps) => {
  const { variant } = useTooltip("Tooltip.Title");
  return (
    <Text
      {...props}
      role="heading"
      aria-role="heading"
      className={cn(tooltipVariants({ variant }).title(), className)}
    />
  );
};
export const TooltipDescription = ({
  className,
  ...props
}: TooltipDescriptionProps) => {
  const { variant } = useTooltip("Tooltip.Description");
  return (
    <Text
      {...props}
      className={cn(tooltipVariants({ variant }).description(), className)}
    />
  );
};
