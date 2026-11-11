import { View } from "@tarojs/components";
import { useMemo } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useTimingNumber } from "../../hooks/use-timing-number";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import { INDICATOR_SIZE, REVEAL_DURATION, ROW_GAP } from "./constants";
import { SelectionModeItemContext, useSelectionMode } from "./context";
import { canEnterSelection, selectionOwnsPress } from "./contracts";
import { SelectionModeIndicator } from "./indicator";
import type { SelectionModeItemProps } from "./types";
import { selectionVariants } from "./variants";

export const SelectionModeItem = ({
  className,
  value,
  onPress,
  onClick,
  disabled = false,
  alwaysShowIndicator = false,
  indicator = "leading",
  children,
  style,
  ...props
}: SelectionModeItemProps) => {
  const { active, enter, toggle, isSelected, sheet } = useSelectionMode();
  const selected = isSelected(value);
  const showing = alwaysShowIndicator || active;
  const selecting = selectionOwnsPress(active, disabled);
  const reduced = usePanelReducedMotion();
  const reveal = useTimingNumber(Number(showing), REVEAL_DURATION, reduced);
  const context = useMemo(() => ({ value }), [value]);
  const leading = indicator === "leading";
  return (
    <SelectionModeItemContext.Provider value={context}>
      <View
        {...props}
        role={selecting ? "checkbox" : "button"}
        aria-role={selecting ? "checkbox" : "button"}
        aria-checked={selecting ? selected : undefined}
        aria-description={
          active || disabled ? undefined : "Long press to select"
        }
        onClick={async (event) => {
          if (selecting) {
            await toggle(value);
          } else if (onClick) {
            onClick(event);
          } else {
            onPress?.();
          }
        }}
        onLongPress={
          canEnterSelection(active, disabled, sheet)
            ? async () => {
                await enter(value);
              }
            : undefined
        }
        className={cn(
          leading &&
            "flex flex-row items-center gap-[24px] px-[32px] py-[20px]",
          className
        )}
        style={mergeStyle({}, style)}
      >
        {leading ? (
          <>
            <View
              aria-hidden
              className="shrink-0 overflow-hidden"
              style={{
                marginInlineEnd: `${(reveal - 1) * ROW_GAP * 2}rpx`,
                opacity: reveal,
                width: `${reveal * INDICATOR_SIZE * 2}rpx`,
              }}
            >
              <SelectionModeIndicator value={value} />
            </View>
            <View style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
              {textChildren(children)}
            </View>
          </>
        ) : null}
        {!leading && indicator === "ring" && showing ? (
          <View className={selectionVariants({ selected }).ring()}>
            {textChildren(children)}
          </View>
        ) : null}
        {!leading && (indicator !== "ring" || !showing)
          ? textChildren(children)
          : null}
      </View>
    </SelectionModeItemContext.Provider>
  );
};
SelectionModeItem.displayName = "SelectionMode.Item";
