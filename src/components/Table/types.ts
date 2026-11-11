import type { View } from "@tarojs/components";
import type { ComponentProps, ReactNode } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { TextProps } from "../primitives/Text";

export type TableSortDirection = "asc" | "desc";
export type TableSize = "default" | "sm";
export type TableSection = "header" | "body" | "footer";
export type CellAlign = "start" | "center" | "end";
export interface TableColumn {
  flex?: number;
  width?: number;
  align?: CellAlign;
}
export interface TableProps extends ComponentProps<typeof View> {
  variant?: "default" | "outline";
  size?: TableSize;
  striped?: boolean;
  columns?: TableColumn[];
}
export type TableHeaderProps = ComponentProps<typeof View>;
export type TableBodyProps = ComponentProps<typeof View>;
export type TableFooterProps = ComponentProps<typeof View>;
export interface TableRowProps extends Omit<
  AnimatedPressableProps,
  "children" | "disabled"
> {
  selected?: boolean;
  disabled?: boolean;
  index?: number;
  last?: boolean;
  children?: ReactNode;
}
export interface TableHeadProps
  extends Omit<ComponentProps<typeof View>, "children">, TableColumn {
  sortable?: boolean;
  sortDirection?: TableSortDirection;
  onPress?: AnimatedPressableProps["onPress"];
  labelClassName?: string;
  children?: ReactNode;
}
export interface TableCellProps
  extends ComponentProps<typeof View>, TableColumn {
  labelClassName?: string;
}
export type TableCaptionProps = TextProps;
export type TableEmptyProps = ComponentProps<typeof View>;
export interface TableFrameProps extends Omit<
  ComponentProps<typeof View>,
  "children"
> {
  title?: ReactNode;
  action?: ReactNode;
  description?: ReactNode;
  size?: TableSize;
  striped?: boolean;
  columns?: TableColumn[];
  children?: ReactNode;
}
