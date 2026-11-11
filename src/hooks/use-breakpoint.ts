import { getWindowInfo } from "@tarojs/taro";
import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useState,
} from "react";
import type { ReactNode } from "react";

import { breakpointAt, breakpointEntries } from "./breakpoint-contract";
import type { BreakpointDefinition } from "./breakpoint-contract";
import { subscribeWindowResize } from "./window-resize-subscription";
const readDimensions = () => {
  const info = getWindowInfo();
  return { height: info.windowHeight, width: info.windowWidth };
};
const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(readDimensions);
  useEffect(
    () => subscribeWindowResize(() => setDimensions(readDimensions())),
    []
  );
  return dimensions;
};
export const BREAKPOINTS = Object.freeze(
  Object.fromEntries([
    ["sm", 640],
    ["md", 768],
    ["lg", 1024],
    ["xl", 1280],
  ]) as Record<"sm" | "md" | "lg" | "xl", number>
);
const DEFAULT_ENTRIES = breakpointEntries(BREAKPOINTS);
export type Breakpoint = keyof typeof BREAKPOINTS;
export interface UseBreakpointResult {
  current: Breakpoint | "base";
  isAtLeast: (breakpoint: Breakpoint) => boolean;
  width: number;
  height: number;
  isLandscape: boolean;
}
export interface BreakpointResult<Name extends string> {
  current: Name | "base";
  isAtLeast: (breakpoint: Name) => boolean;
  width: number;
  height: number;
  isLandscape: boolean;
}
export interface BreakpointProviderProps {
  children?: ReactNode;
}
export interface BreakpointContract<Name extends string> {
  Provider: (props: BreakpointProviderProps) => ReactNode;
  useBreakpoint: () => BreakpointResult<Name>;
  breakpoints: Readonly<Record<Name, number>>;
}
export const createBreakpoints = <const T extends BreakpointDefinition>(
  definition: T
): BreakpointContract<keyof T & string> => {
  type Name = keyof T & string;
  const breakpoints = Object.freeze({ ...definition }) as Readonly<T>;
  const entries = breakpointEntries(breakpoints);
  const Context = createContext<{
    width: number;
    height: number;
  } | null>(null);
  const Provider = ({ children }: BreakpointProviderProps) => {
    const dimensions = useWindowDimensions();
    return createElement(Context.Provider, { value: dimensions }, children);
  };
  const useBoundBreakpoint = (): BreakpointResult<Name> => {
    const dimensions = useContext(Context);
    if (!dimensions) {
      throw new Error(
        "This breakpoint hook must be used inside its Breakpoint Provider."
      );
    }
    const { width, height } = dimensions;
    return {
      current: breakpointAt(entries, width),
      height,
      isAtLeast: (name) => width >= breakpoints[name],
      isLandscape: width > height,
      width,
    };
  };
  return { Provider, breakpoints, useBreakpoint: useBoundBreakpoint };
};
export const useBreakpoint = (): UseBreakpointResult => {
  const { width, height } = useWindowDimensions();
  const current = breakpointAt(DEFAULT_ENTRIES, width);
  return {
    current,
    height,
    isAtLeast: (breakpoint) => width >= BREAKPOINTS[breakpoint],
    isLandscape: width > height,
    width,
  };
};
