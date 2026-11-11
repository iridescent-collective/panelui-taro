import { View } from "@tarojs/components";
import { forwardRef, useContext } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import {
  TableContext,
  TableRowContext,
  useRowCells,
  useSectionRows,
} from "./context";
import type {
  TableHeaderProps,
  TableBodyProps,
  TableFooterProps,
  TableRowProps,
} from "./types";
import { tableVariants } from "./variants";

export const TableHeader = forwardRef<
  ComponentRef<typeof View>,
  TableHeaderProps
>(({ className, children, ...props }, ref) => {
  const rows = useSectionRows(children, "header");
  return (
    <View
      {...props}
      ref={ref}
      role="rowgroup"
      aria-role="rowgroup"
      className={cn(
        "flex w-full flex-col border-b-[2px] border-solid border-[var(--panel-border)]",
        className
      )}
    >
      {rows}
    </View>
  );
});
export const TableBody = forwardRef<ComponentRef<typeof View>, TableBodyProps>(
  ({ className, children, ...props }, ref) => {
    const rows = useSectionRows(children, "body");
    return (
      <View
        {...props}
        ref={ref}
        role="rowgroup"
        aria-role="rowgroup"
        className={cn("flex w-full flex-col", className)}
      >
        {rows}
      </View>
    );
  }
);
export const TableFooter = forwardRef<
  ComponentRef<typeof View>,
  TableFooterProps
>(({ className, children, ...props }, ref) => {
  const rows = useSectionRows(children, "footer");
  return (
    <View
      {...props}
      ref={ref}
      role="rowgroup"
      aria-role="rowgroup"
      className={cn(
        "flex w-full flex-col border-t-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-muted-opacity-50)]",
        className
      )}
    >
      {rows}
    </View>
  );
});
export const TableRow = forwardRef<ComponentRef<typeof View>, TableRowProps>(
  (
    {
      className,
      selected,
      disabled,
      index,
      last,
      children,
      onPress,
      onClick,
      ...props
    },
    ref
  ) => {
    const { size, striped, columns } = useContext(TableContext);
    const row = useContext(TableRowContext);
    const cells = useRowCells(children, Boolean(columns));
    const position = index ?? row.index;
    const ruled = row.section === "body" && !(last ?? row.last);
    const striping =
      striped && row.section === "body" && position % 2 === 1 && !selected;
    const classes = tableVariants({ size }).row({
      className: cn(
        ruled && "border-b-[2px] border-solid border-[var(--panel-border)]",
        striping && "bg-[var(--panel-muted-opacity-40)]",
        selected && "bg-[var(--panel-accent)]",
        disabled && "opacity-[0.64]",
        className
      ),
    });
    const press = onClick ?? onPress;
    return press ? (
      <AnimatedPressable
        {...props}
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{
          disabled: Boolean(disabled),
          selected: Boolean(selected),
        }}
        disabled={disabled}
        onPress={press}
        className={classes}
      >
        {cells}
      </AnimatedPressable>
    ) : (
      <View
        {...props}
        ref={ref}
        role="row"
        aria-role="row"
        aria-disabled={Boolean(disabled)}
        aria-selected={Boolean(selected)}
        className={classes}
      >
        {cells}
      </View>
    );
  }
);
