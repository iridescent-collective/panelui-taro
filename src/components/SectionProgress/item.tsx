import { View } from "@tarojs/components";

import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { useSectionProgress } from "./context";
import type { SectionProgressItemProps } from "./types";

export const SectionProgressItem = ({
  className,
  value,
  children,
}: SectionProgressItemProps) => {
  const context = useSectionProgress();
  const selected = context.value === value;
  return (
    <AnimatedPressable
      accessibilityRole="menuitem"
      accessibilityState={{ selected }}
      onPress={() => context.onValueChange(value)}
      pressScale={1}
      pressOpacity={1}
      hoverClass="panelui-sectionprogress-item-active"
      className={cn(
        "flex flex-row items-center gap-[24px] rounded-[var(--panel-radius-xl)] px-[24px] py-[16px]",
        selected && "bg-[var(--panel-accent)]",
        className
      )}
    >
      <View
        style={selected ? { backgroundColor: context.tint } : undefined}
        className={cn(
          "h-[12px] w-[12px] shrink-0 rounded-full",
          !selected && "bg-[var(--panel-muted-foreground)] opacity-[0.4]"
        )}
      />
      <Text
        size="sm"
        weight={selected ? "medium" : "normal"}
        numberOfLines={2}
        className={
          selected
            ? "text-[color:var(--panel-foreground)]"
            : "text-[color:var(--panel-muted-foreground)]"
        }
      >
        {children}
      </Text>
    </AnimatedPressable>
  );
};
SectionProgressItem.displayName = "SectionProgress.Item";
