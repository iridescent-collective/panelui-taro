import { createContext, useContext, useCallback } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type {
  PanelsideMode,
  PanelsideItemSize,
  UsePanelsideResult,
} from "./types";

export interface PanelsideContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  progress: ObservableNumber;
  width: number;
  mode: PanelsideMode;
  docked: boolean;
  dismissible: boolean;
  scale?: number;
  radius?: number;
  dim?: number;
  route: string;
  navigate: (route: string) => void;
}
export const PanelsideContext = createContext<PanelsideContextValue | null>(
  null
);
export const usePanelsideContext = (
  component: string
): PanelsideContextValue => {
  const context = useContext(PanelsideContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Panelside>`);
  }
  return context;
};
export const usePanelside = (): UsePanelsideResult => {
  const { open, setOpen, toggle, progress, docked, route, navigate } =
    usePanelsideContext("usePanelside");
  const go = useCallback(
    (next: string) => {
      navigate(next);
      setOpen(false);
    },
    [navigate, setOpen]
  );
  return { docked, navigate: go, open, progress, route, setOpen, toggle };
};
export interface PanelsideSurfaceValue {
  footerHeight: number;
  setFooterHeight: (height: number) => void;
}
export const PanelsideSurfaceContext =
  createContext<PanelsideSurfaceValue | null>(null);
export interface PanelsideItemContextValue {
  active: boolean;
  disabled: boolean;
  size: PanelsideItemSize;
  tint: string | undefined;
}
export const PanelsideItemContext =
  createContext<PanelsideItemContextValue | null>(null);
export const usePanelsideItem = (part: string): PanelsideItemContextValue => {
  const value = useContext(PanelsideItemContext);
  if (!value) {
    throw new Error(`${part} must be used inside a <Panelside.Item>.`);
  }
  return value;
};
