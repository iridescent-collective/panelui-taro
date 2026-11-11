import type { ReactNode } from "react";

export type SelectPresentation = "sheet" | "inline" | "overlay";
export type SelectSize = "xs" | "sm" | "md" | "lg" | "xl";
export interface SelectItemProps {
  value: string;
  label: string;

  className?: string;

  labelClassName?: string;

  disabled?: boolean;
}
export interface SelectGroupProps {
  label?: string;

  className?: string;

  labelClassName?: string;
  children: ReactNode;
}
export interface SelectSheetProps {
  native?: boolean;

  snapPoints?: ("half" | "full" | { fraction: number } | { height: number })[];

  nativeBackground?: boolean | string;

  size?: "auto" | "half" | "full";
}
export interface SelectProps {
  className?: string;

  value?: string;

  valueLabel?: string;

  onValueChange: (value: string) => void;

  placeholder?: string;

  disabled?: boolean;

  size?: SelectSize;

  triggerClassName?: string;

  valueClassName?: string;

  placeholderClassName?: string;

  listClassName?: string;

  searchClassName?: string;

  searchInputClassName?: string;

  searchContainerClassName?: string;

  emptyClassName?: string;

  presentation?: SelectPresentation;

  title?: string;

  sheetProps?: SelectSheetProps;

  contentWidth?: "trigger" | "content" | number;

  offset?: number;

  onOpenChange?: (open: boolean) => void;

  searchable?: boolean;

  searchPlaceholder?: string;

  emptyMessage?: string;

  native?: boolean;

  nativeAppearance?: "menu" | "wheel";
  children: ReactNode;
}
