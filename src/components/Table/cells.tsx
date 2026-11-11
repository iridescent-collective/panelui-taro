import { View } from "@tarojs/components";
import { forwardRef, useContext } from "react";
import type { ComponentRef } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronUpIcon } from "../../icons";
import { selectionTick } from "../../lib/haptics";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { alignment, columnStyle, TableContext, useColumn } from "./context";
import type {
  TableHeadProps,
  TableCellProps,
  TableCaptionProps,
  TableEmptyProps,
} from "./types";
import { tableVariants } from "./variants";

const SORT_DURATION = 160;
export const TableHead = forwardRef<ComponentRef<typeof View>, TableHeadProps>(
  (
    {
      className,
      labelClassName,
      align: ownAlign,
      sortable,
      sortDirection,
      onPress,
      onClick,
      flex: ownFlex,
      width: ownWidth,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const { size } = useContext(TableContext);
    const column = useColumn({
      align: ownAlign,
      flex: ownFlex,
      width: ownWidth,
    });
    const slots = tableVariants({ size });
    const inactive = useThemeToken("muted-foreground");
    const active = useThemeToken("foreground");
    const reduced = usePanelReducedMotion();
    const classes = slots.head({
      className: cn(alignment[column.align], className),
    });
    const label = (
      <>
        {textChildren(children, (text) => (
          <Text
            className={slots.headLabel({
              className: cn(
                sortDirection &&
                  "font-semibold text-[color:var(--panel-foreground)]",
                labelClassName
              ),
            })}
          >
            {text}
          </Text>
        ))}
        {sortable || sortDirection ? (
          <View
            aria-hidden
            style={{
              opacity: sortDirection ? 1 : 0.35,
              transform: `rotate(${sortDirection === "desc" ? 180 : 0}deg)`,
              transition: reduced
                ? "none"
                : `transform ${SORT_DURATION}ms ease`,
            }}
          >
            <ChevronUpIcon
              size={sortDirection ? 16 : 14}
              color={sortDirection ? active : inactive}
            />
          </View>
        ) : null}
      </>
    );
    const press = onClick ?? onPress;
    let hint = "Sorts the table by this column";
    if (sortDirection === "asc") {
      hint = "Sorts this column in descending order";
    }
    if (sortDirection === "desc") {
      hint = "Sorts this column in ascending order";
    }
    return press ? (
      <AnimatedPressable
        {...props}
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ selected: Boolean(sortDirection) }}
        accessibilityHint={hint}
        onPress={async (event) => {
          press(event);
          await selectionTick();
        }}
        className={classes}
        style={mergeStyle(columnStyle(column), style)}
      >
        {label}
      </AnimatedPressable>
    ) : (
      <View
        {...props}
        ref={ref}
        role="columnheader"
        aria-role="columnheader"
        className={classes}
        style={mergeStyle(columnStyle(column), style)}
      >
        {label}
      </View>
    );
  }
);
export const TableCell = forwardRef<ComponentRef<typeof View>, TableCellProps>(
  (
    {
      className,
      labelClassName,
      align: ownAlign,
      flex: ownFlex,
      width: ownWidth,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const { size } = useContext(TableContext);
    const column = useColumn({
      align: ownAlign,
      flex: ownFlex,
      width: ownWidth,
    });
    const slots = tableVariants({ size });
    return (
      <View
        {...props}
        ref={ref}
        role="cell"
        aria-role="cell"
        className={slots.cell({
          className: cn(alignment[column.align], className),
        })}
        style={mergeStyle(columnStyle(column), style)}
      >
        {textChildren(children, (text) => (
          <Text className={slots.cellLabel({ className: labelClassName })}>
            {text}
          </Text>
        ))}
      </View>
    );
  }
);
export const TableCaption = forwardRef<
  ComponentRef<typeof Text>,
  TableCaptionProps
>(({ className, ...props }, ref) => {
  const { size } = useContext(TableContext);
  return (
    <Text
      {...props}
      ref={ref}
      className={tableVariants({ size }).caption({ className })}
    />
  );
});
export const TableEmpty = forwardRef<
  ComponentRef<typeof View>,
  TableEmptyProps
>(({ className, children, ...props }, ref) => {
  const { size } = useContext(TableContext);
  return (
    <View
      {...props}
      ref={ref}
      role="row"
      aria-role="row"
      className={cn(
        "flex w-full flex-col items-center justify-center px-[32px] py-[64px]",
        className
      )}
    >
      {textChildren(children, (text) => (
        <Text className={tableVariants({ size }).caption()}>{text}</Text>
      ))}
    </View>
  );
});
