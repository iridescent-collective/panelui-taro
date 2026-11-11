import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";

export interface SignatureProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  size?: "sm" | "md" | "lg" | "full";
  strokeColor?: string;
  strokeWidth?: number;
  minDistance?: number;
  guideline?: boolean;
  guidelineLabel?: string;
  placeholder?: ReactNode;
  disabled?: boolean;
  onRequestAlternative?: () => void;
  onBegin?: () => void;
  onEnd?: () => void;
  onChange?: (strokeCount: number) => void;
  padClassName?: string;
  placeholderClassName?: string;
  guideClassName?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityActions?: { name: string; label: string }[];
  onAccessibilityAction?: (event: {
    nativeEvent: { actionName: string };
  }) => void;
}
export interface SignatureSaveOptions {
  directory?: string;
  filename?: string;
  format?: "svg" | "png";
  scale?: number;
}
export interface SignatureFile {
  uri: string;
  format: "svg" | "png";
  width: number;
  height: number;
}
export interface SignatureHandle {
  clear: () => void;
  undo: () => void;
  redo: () => void;
  isEmpty: () => boolean;
  strokeCount: () => number;
  toSVG: () => string;
  toDataURL: (format?: "svg" | "png") => Promise<string>;
  save: (options?: SignatureSaveOptions) => Promise<SignatureFile>;
}
export type SignatureToolbarProps = ComponentProps<typeof View>;
export interface SignatureButtonProps extends Omit<
  AnimatedPressableProps,
  "children"
> {
  children?: ReactNode;
}
