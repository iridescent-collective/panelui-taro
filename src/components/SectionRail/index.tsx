import { View } from "@tarojs/components";

import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import { SectionRailBar } from "./bar";
import { ALIGNMENT } from "./constants";
import { SectionRailContent } from "./content";
import { SectionRailContext } from "./context";
import { SectionRailItem } from "./item";
import { SectionRailTrigger } from "./trigger";
import type { SectionRailProps } from "./types";
import { useSectionRailState } from "./use-state";

export type {
  SectionRailProps,
  SectionRailTriggerProps,
  SectionRailBarProps,
  SectionRailContentProps,
  SectionRailItemProps,
  SectionRailPlacement,
  SectionRailAlign,
} from "./types";
const SectionRailRoot = ({
  className,
  placement = "right",
  align = "center",
  haptics = false,
  value,
  defaultValue,
  onValueChange,
  open,
  defaultOpen = false,
  onOpenChange,
  closeDelay = 300,
  offset = 12,
  children,
  style,
  ...props
}: SectionRailProps) => {
  const state = useSectionRailState({
    children,
    closeDelay,
    defaultOpen,
    defaultValue,
    haptics,
    onOpenChange,
    onValueChange,
    open,
    value,
  });
  const { insets } = useWindowMetrics();
  const context = { ...state, align, placement };
  return (
    <SectionRailContext.Provider value={context}>
      <View
        {...props}
        className={cn(
          "panelui-sectionrail-root absolute flex flex-col",
          ALIGNMENT[align],
          placement === "right" ? "right-[0px]" : "left-[0px]",
          className
        )}
        style={mergeStyle(
          { pointerEvents: "none" },
          style ?? {
            [placement]: `${((placement === "right" ? insets.right : insets.left) + offset) * 2}rpx`,
            bottom: `${insets.bottom * 2}rpx`,
            top: `${insets.top * 2}rpx`,
          }
        )}
      >
        {textChildren(children)}
      </View>
    </SectionRailContext.Provider>
  );
};
export const SectionRail = Object.assign(SectionRailRoot, {
  Bar: SectionRailBar,
  Content: SectionRailContent,
  Item: SectionRailItem,
  Trigger: SectionRailTrigger,
});
