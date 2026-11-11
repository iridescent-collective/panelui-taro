import type { Textarea as NativeTextarea } from "@tarojs/components";
import type { ComponentProps } from "react";

import type { InputProps } from "../Input/types";

export interface ContentSizeEvent {
  nativeEvent: { contentSize: { height: number; width: number } };
}
export interface TextareaProps extends Omit<
  InputProps,
  "multiline" | "startContent" | "endContent" | "interactiveContent"
> {
  rows?: number;
  maxRows?: number;
  autoGrow?: boolean;
  showCount?: boolean;
  onContentSizeChange?: (event: ContentSizeEvent) => void;
  onLineChange?: ComponentProps<typeof NativeTextarea>["onLineChange"];
}
