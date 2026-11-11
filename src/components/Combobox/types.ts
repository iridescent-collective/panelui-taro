import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

export type ComboboxPresentation = "overlay" | "inline";
export type ComboboxMode = "single" | "multiple";
export interface ComboboxSelection {
  single: string | undefined;
  multiple: string[];
}
export interface ComboboxItemProps {
  value: string;
  label: string;
  disabled?: boolean;
  start?: ReactNode;
  description?: string;
}
export interface ComboboxGroupProps {
  label?: string;
  className?: string;
  labelClassName?: string;
  children: ReactNode;
}
export interface ComboboxProps<
  Mode extends ComboboxMode = "single",
> extends Omit<ComponentProps<typeof View>, "children"> {
  mode?: Mode;
  value?: ComboboxSelection[Mode];
  defaultValue?: ComboboxSelection[Mode];
  onValueChange?: (value: ComboboxSelection[Mode]) => void;
  inputValue?: string;
  defaultInputValue?: string;
  onInputValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  presentation?: ComboboxPresentation;
  filter?: boolean | ((option: ComboboxItemProps, query: string) => boolean);
  allowCustomValue?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  clearable?: boolean;
  openOnFocus?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentWidth?: "field" | "content" | number;
  offset?: number;
  listClassName?: string;
  accessibilityLabel?: string;
  children: ReactNode;
}
export interface ComboboxAnchor {
  x: number;
  y: number;
  width: number;
  height: number;
}
