import type { ObservableNumber } from "../../primitives/observable-number";
import type { TextProps } from "../primitives/Text";

export type ScrollTextEffect = "color" | "fade" | "rise" | "highlight";
export type ScrollTextSplit = "word" | "character";
export interface ScrollTextProps extends Omit<TextProps, "children"> {
  children?: string;
  effect?: ScrollTextEffect;
  by?: ScrollTextSplit;
  from?: string;
  to?: string;
  start?: number;
  end?: number;
  stagger?: number;
  progress?: ObservableNumber;
  enabled?: boolean;
}
