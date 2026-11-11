import { createContext, useContext, useMemo } from "react";

import type {
  PopoverAnchorControls,
  PopoverAnchorRect,
  PopoverPlacement,
  PopoverPresentation,
} from "./types";

export interface PopoverContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  trigger: PopoverAnchorRect | null;
  setTrigger: (rect: PopoverAnchorRect) => void;
  placement: PopoverPlacement;
  setPlacement: (placement: PopoverPlacement) => void;
  arrowOffset: number;
  setArrowOffset: (offset: number) => void;
  presentation: PopoverPresentation;
}
export const PopoverContext = createContext<PopoverContextValue | null>(null);
export const usePopover = (component: string): PopoverContextValue => {
  const context = useContext(PopoverContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Popover>`);
  }
  return context;
};
export const usePopoverAnchor = (component: string): PopoverAnchorControls => {
  const { open, setOpen, setTrigger } = usePopover(component);
  return useMemo(
    () => ({ anchorTo: setTrigger, open, setOpen }),
    [open, setOpen, setTrigger]
  );
};
