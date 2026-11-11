import { ScrollView, View } from "@tarojs/components";
import { Children, isValidElement } from "react";
import type { ReactNode } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text } from "../primitives/Text";
import { useSelectionMode } from "./context";
import type { SelectionModeGroupProps } from "./types";
import { selectionVariants } from "./variants";

const itemKey = (item: ReactNode, index: number) =>
  isValidElement(item) ? (item.key ?? index) : index;
const GroupCaption = ({
  label,
  className,
  children,
}: {
  label?: string;
  className?: string;
  children: ReactNode;
}) =>
  label === undefined ? (
    children
  ) : (
    <View aria-label={label}>
      <Text
        size="sm"
        weight="medium"
        muted
        className={cn(selectionVariants().groupLabel(), className)}
      >
        {label}
      </Text>
      {children}
    </View>
  );
export const SelectionModeGroup = ({
  className,
  columns,
  horizontal = false,
  itemWidth = 44,
  gap = 12,
  label,
  labelClassName,
  separators = true,
  children,
  style,
  ...props
}: SelectionModeGroupProps) => {
  const items = Children.toArray(children).filter(Boolean);
  const { sheet } = useSelectionMode();
  const slots = selectionVariants({ surface: sheet ? "sheet" : "screen" });
  let content: ReactNode;
  if (horizontal) {
    content = (
      <ScrollView
        {...props}
        scrollX
        showScrollbar={false}
        className={className}
        style={style}
      >
        <View
          className="flex flex-row"
          style={{ gap: `${gap * 2}rpx`, width: "max-content" }}
        >
          {items.map((item, index) => (
            <View
              key={itemKey(item, index)}
              className="shrink-0"
              style={{ width: `${itemWidth * 2}rpx` }}
            >
              {item}
            </View>
          ))}
        </View>
      </ScrollView>
    );
  } else if (columns && columns > 0) {
    content = (
      <View
        {...props}
        className={className}
        style={mergeStyle(
          {
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            margin: `${-gap}rpx`,
          },
          style
        )}
      >
        {items.map((item, index) => (
          <View
            key={itemKey(item, index)}
            style={{
              boxSizing: "border-box",
              padding: `${gap}rpx`,
              width: `${100 / columns}%`,
            }}
          >
            {item}
          </View>
        ))}
      </View>
    );
  } else {
    content = (
      <View {...props} className={cn(slots.group(), className)} style={style}>
        {items.map((item, index) => (
          <View key={itemKey(item, index)}>
            {separators && index > 0 ? (
              <View
                aria-hidden
                className="ml-[112px] h-[2px] bg-[var(--panel-border)]"
              />
            ) : null}
            {item}
          </View>
        ))}
      </View>
    );
  }
  return (
    <GroupCaption label={label} className={labelClassName}>
      {content}
    </GroupCaption>
  );
};
SelectionModeGroup.displayName = "SelectionMode.Group";
