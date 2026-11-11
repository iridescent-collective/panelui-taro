import { View } from "@tarojs/components";

import { XIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Collapse } from "../../primitives/collapse";
import { Text, textChildren } from "../primitives/Text";
import { REVEAL_DURATION } from "./constants";
import { useSelectionMode } from "./context";
import type { SelectionModeHeaderProps } from "./types";
import { selectionVariants } from "./variants";

const HeaderEnds = ({
  hideSelectAll,
  title,
}: {
  hideSelectAll: boolean;
  title: string;
}) => {
  const { exit, count, total, allSelected, selectAll, clear, sheet } =
    useSelectionMode();
  const slots = selectionVariants();
  return (
    <>
      <View className="flex w-[160px] flex-col items-start">
        {sheet ? null : (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Cancel selection"
            onPress={exit}
            hitSlop={12}
            pressScale={1}
            pressOpacity={1}
            className={cn(slots.close(), "flex")}
          >
            <XIcon size={20} />
          </AnimatedPressable>
        )}
      </View>
      <Text numberOfLines={1} className={slots.title()}>
        {count > 0 ? `${title} (${count})` : title}
      </Text>
      <View className="flex w-[160px] flex-col items-end">
        {hideSelectAll || total === 0 ? null : (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={allSelected ? "Clear selection" : "Select all"}
            accessibilityState={{ checked: allSelected }}
            onPress={allSelected ? clear : selectAll}
            hitSlop={12}
            pressScale={1}
            pressOpacity={1}
          >
            <Text
              size="sm"
              weight="medium"
              className="text-[color:var(--panel-primary)]"
            >
              {allSelected ? "Clear" : "All"}
            </Text>
          </AnimatedPressable>
        )}
      </View>
    </>
  );
};
export const SelectionModeHeader = ({
  className,
  title = "Select",
  hideSelectAll = false,
  children,
  ...props
}: SelectionModeHeaderProps) => {
  const { active } = useSelectionMode();
  return (
    <Collapse
      {...props}
      open={active}
      duration={REVEAL_DURATION}
      aria-hidden={!active}
      className={cn(selectionVariants().header(), className)}
    >
      {children ? (
        textChildren(children)
      ) : (
        <HeaderEnds title={title} hideSelectAll={hideSelectAll} />
      )}
    </Collapse>
  );
};
SelectionModeHeader.displayName = "SelectionMode.Header";
