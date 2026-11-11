import type { View } from "@tarojs/components";
import type { ComponentProps, ComponentRef, ReactNode } from "react";

import type { InputHandle } from "../Input/types";
import type { TextareaProps } from "../Textarea";
import type { EditorSelection } from "./transforms";

export type MarkdownEditorMode = "write" | "preview";
export type MarkdownEditorAction =
  | "bold"
  | "italic"
  | "heading"
  | "quote"
  | "code"
  | "bulletList"
  | "orderedList"
  | "link"
  | "image";
export type MarkdownEditorToolbarVariant = "bar" | "pill";
export interface MarkdownEditorHandle {
  readonly view: ComponentRef<typeof View> | null;
  apply: (action: MarkdownEditorAction) => void;
  getActive: () => MarkdownEditorAction[];
  getSelection: () => EditorSelection;
  setSelection: (selection: EditorSelection) => void;
  focus: () => void;
  blur: () => void;
  setMode: (mode: MarkdownEditorMode) => void;
}
export interface MarkdownEditorProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  mode?: MarkdownEditorMode;
  defaultMode?: MarkdownEditorMode;
  onModeChange?: (mode: MarkdownEditorMode) => void;
  disabled?: boolean;
  children?: ReactNode;
  placeholder?: string;
  rows?: number;
  avoidKeyboard?: boolean;
  continueLists?: boolean;
}
export interface MarkdownEditorToolbarProps extends ComponentProps<
  typeof View
> {
  variant?: MarkdownEditorToolbarVariant;
  actions?: MarkdownEditorAction[];
  showModeSwitch?: boolean;
}
export type MarkdownEditorInputProps = Omit<
  TextareaProps,
  "value" | "onChangeText" | "defaultValue"
>;
export interface MarkdownEditorPreviewProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  emptyText?: string;
}
export interface MarkdownEditorContextValue {
  value: string;
  mode: MarkdownEditorMode;
  setMode: (mode: MarkdownEditorMode) => void;
  run: (action: MarkdownEditorAction) => void;
  active: ReadonlySet<MarkdownEditorAction>;
  pending: EditorSelection | undefined;
  setSelection: (selection: EditorSelection) => void;
  clearPending: () => void;
  onChangeText: (next: string, cursor?: number) => string;
  registerField: (field: InputHandle | null) => void;
  disabled: boolean;
}
