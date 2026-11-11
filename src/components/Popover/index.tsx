import { useMemo, useState } from "react";

import { cn } from "../../lib/utils";
import { useControllableState } from "../../primitives/controllable-state";
import { Text } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { PopoverTrigger, PopoverClose } from "./actions";
import { PopoverArrow } from "./arrow";
import { PopoverContent } from "./content";
import { PopoverContext } from "./context";
import type {
  PopoverProps,
  PopoverAnchorRect,
  PopoverPlacement,
} from "./types";

export { usePopoverAnchor } from "./context";
export type {
  PopoverPlacement,
  PopoverAlign,
  PopoverAnchorRect,
  PopoverPresentation,
  PopoverAnchorControls,
  PopoverProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverArrowProps,
  PopoverCloseProps,
} from "./types";
const PopoverRoot = ({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
  presentation = "popover",
}: PopoverProps) => {
  const { value, setValue } = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: open,
  });
  const [trigger, setTrigger] = useState<PopoverAnchorRect | null>(null);
  const [placement, setPlacement] = useState<PopoverPlacement>("bottom");
  const [arrowOffset, setArrowOffset] = useState(0);
  const context = useMemo(
    () => ({
      arrowOffset,
      open: value,
      placement,
      presentation,
      setArrowOffset,
      setOpen: setValue,
      setPlacement,
      setTrigger,
      trigger,
    }),
    [value, setValue, trigger, placement, arrowOffset, presentation]
  );
  return (
    <PopoverContext.Provider value={context}>
      {children}
    </PopoverContext.Provider>
  );
};
const PopoverTitle = ({ className, ...props }: TextProps) => (
  <Text
    size="base"
    weight="semibold"
    className={cn("text-[color:var(--panel-popover-foreground)]", className)}
    {...props}
  />
);
const PopoverDescription = (props: TextProps) => (
  <Text size="sm" muted {...props} />
);
export const Popover = Object.assign(PopoverRoot, {
  Arrow: PopoverArrow,
  Close: PopoverClose,
  Content: PopoverContent,
  Description: PopoverDescription,
  Title: PopoverTitle,
  Trigger: PopoverTrigger,
});
