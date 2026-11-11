import { useEffect, useMemo, useState } from "react";

import { useControllableState } from "../../primitives/controllable-state";
import { TooltipArrow } from "./arrow";
import { TooltipContent } from "./content";
import { TooltipContext } from "./context";
import { TooltipDescription, TooltipText, TooltipTitle } from "./text";
import { TooltipTrigger } from "./trigger";
import type { TooltipProps, TooltipPlacement, TooltipVariant } from "./types";

export type {
  TooltipProps,
  TooltipTriggerProps,
  TooltipContentProps,
  TooltipArrowProps,
  TooltipTitleProps,
  TooltipDescriptionProps,
  TooltipPlacement,
  TooltipAlign,
  TooltipVariant,
  TooltipOpenOn,
} from "./types";
const TooltipRoot = ({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
  openOn = "longPress",
  duration = 1500,
  label,
}: TooltipProps) => {
  const { value, setValue } = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: open,
  });
  const [trigger, setTrigger] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
  const [placement, setPlacement] = useState<TooltipPlacement>("top");
  const [arrowOffset, setArrowOffset] = useState(0);
  const [variant, setVariant] = useState<TooltipVariant>("inverted");
  useEffect(() => {
    if (!value || !Number.isFinite(duration) || duration <= 0) {
      return;
    }
    const timer = setTimeout(() => setValue(false), duration);
    return () => clearTimeout(timer);
  }, [value, duration, setValue]);
  const context = useMemo(
    () => ({
      arrowOffset,
      hide: () => setValue(false),
      label,
      open: value,
      openOn,
      placement,
      setArrowOffset,
      setPlacement,
      setTrigger,
      setVariant,
      show: () => setValue(true),
      trigger,
      variant,
    }),
    [arrowOffset, label, value, openOn, placement, setValue, trigger, variant]
  );
  return (
    <TooltipContext.Provider value={context}>
      {children}
    </TooltipContext.Provider>
  );
};
export const Tooltip = Object.assign(TooltipRoot, {
  Arrow: TooltipArrow,
  Content: TooltipContent,
  Description: TooltipDescription,
  Text: TooltipText,
  Title: TooltipTitle,
  Trigger: TooltipTrigger,
});
