import { createContext, useContext } from "react";

import type { TooltipProps, TooltipPlacement, TooltipVariant } from "./types";

interface TriggerRect {
  x: number;
  y: number;
  width: number;
  height: number;
}
export const TooltipContext = createContext<{
  open: boolean;
  show: () => void;
  hide: () => void;
  trigger: TriggerRect | null;
  setTrigger: (rect: TriggerRect | null) => void;
  placement: TooltipPlacement;
  setPlacement: (placement: TooltipPlacement) => void;
  arrowOffset: number;
  setArrowOffset: (offset: number) => void;
  openOn: NonNullable<TooltipProps["openOn"]>;
  label?: string;
  variant: TooltipVariant;
  setVariant: (variant: TooltipVariant) => void;
} | null>(null);
export const useTooltip = (component: string) => {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Tooltip>`);
  }
  return context;
};
