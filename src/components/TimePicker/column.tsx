import { CustomWrapper, ScrollView, View } from "@tarojs/components";
import { useSyncExternalStore } from "react";

import { cn } from "../../lib/utils";
import type { ObservableNumber } from "../../primitives/observable-number";
import { Text } from "../primitives/Text";
import { COLUMN_HEIGHT, ROW_HEIGHT } from "./constants";
import { rowAppearance } from "./math";
import { useSnap } from "./use-snap";
import { timePickerVariants } from "./variants";

interface ColumnProps<T> {
  items: readonly T[];
  index: number;
  syncToken: number;
  onIndexChange: (index: number) => void;
  label: (item: T) => string;
  disabled?: boolean;
  accessibilityLabel: string;
  className?: string;
}
const ColumnRow = ({
  offset,
  index,
  selected,
  pixelHeight,
  children,
}: {
  offset: ObservableNumber;
  index: number;
  selected: boolean;
  pixelHeight: number;
  children: string;
}) => {
  const at = useSyncExternalStore(
    offset.subscribe,
    offset.getSnapshot,
    offset.getSnapshot
  );
  const slots = timePickerVariants();
  return (
    <View
      style={{ ...rowAppearance(at, index), height: `${pixelHeight}px` }}
      className={cn("flex flex-col", slots.row())}
    >
      <Text
        className={cn(slots.rowLabel(), selected && slots.rowLabelSelected())}
      >
        {children}
      </Text>
    </View>
  );
};
export const Column = <T,>({
  items,
  index,
  syncToken,
  onIndexChange,
  label,
  disabled,
  accessibilityLabel,
  className,
}: ColumnProps<T>) => {
  const scrolling = useSnap(
    index,
    items.length,
    ROW_HEIGHT,
    syncToken,
    disabled,
    onIndexChange,
    items.map(label).join("\0")
  );
  return (
    <View className={cn("min-w-0", className)}>
      <CustomWrapper>
        <ScrollView
          id={scrolling.id}
          enhanced
          scrollY={!disabled}
          bounces={false}
          showScrollbar={false}
          scrollWithAnimation={false}
          scrollTop={scrolling.position}
          className="panel-time-column"
          style={{
            height: `${(scrolling.pixelSpacing * COLUMN_HEIGHT) / ROW_HEIGHT}px`,
            width: "100%",
          }}
          aria-label={accessibilityLabel}
          aria-disabled={disabled}
          aria-valuetext={
            items[index] === undefined ? undefined : label(items[index])
          }
          onTouchStart={scrolling.start}
          onTouchEnd={scrolling.release}
          onTouchCancel={scrolling.abort}
          onDragStart={scrolling.start}
          onDragEnd={scrolling.release}
          onScroll={scrolling.onScroll}
          onScrollEnd={() => {
            void scrolling.finish();
          }}
          onLongPress={() => {
            void scrolling.adjust();
          }}
        >
          <CustomWrapper>
            <View
              style={{
                paddingBottom: `${(scrolling.pixelSpacing * (COLUMN_HEIGHT / ROW_HEIGHT - 1)) / 2}px`,
                paddingTop: `${(scrolling.pixelSpacing * (COLUMN_HEIGHT / ROW_HEIGHT - 1)) / 2}px`,
              }}
            >
              {items.map((item, row) => (
                <ColumnRow
                  key={label(item)}
                  index={row}
                  selected={row === index}
                  pixelHeight={scrolling.pixelSpacing}
                  offset={scrolling.signal}
                >
                  {label(item)}
                </ColumnRow>
              ))}
            </View>
          </CustomWrapper>
        </ScrollView>
      </CustomWrapper>
    </View>
  );
};
