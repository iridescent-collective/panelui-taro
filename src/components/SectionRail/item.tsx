import { useDirection } from "../../hooks/use-direction";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { useSectionRail } from "./context";
import type { SectionRailItemProps } from "./types";

export const SectionRailItem = ({
  className,
  value,
  level = 0,
  children,
}: SectionRailItemProps) => {
  const {
    value: active,
    onValueChange,
    open,
  } = useSectionRail("SectionRail.Item");
  const selected = active === value;
  const direction = useDirection();
  return (
    <AnimatedPressable
      accessibilityRole="menuitem"
      aria-selected={selected}
      disabled={!open}
      pressScale={1}
      pressOpacity={1}
      onPress={() => onValueChange(value)}
      hoverClass="panelui-sectionrail-item-active"
      style={{
        [direction === "rtl" ? "paddingRight" : "paddingLeft"]:
          `${(10 + level * 10) * 2}rpx`,
      }}
      className={cn(
        "rounded-[var(--panel-radius-lg)] py-[12px] pe-[16px]",
        selected && "bg-[var(--panel-accent)]",
        className
      )}
    >
      <Text
        size="sm"
        weight={selected ? "medium" : "normal"}
        className={
          selected
            ? "text-[var(--panel-foreground)]"
            : "text-[var(--panel-muted-foreground)]"
        }
        numberOfLines={2}
      >
        {children}
      </Text>
    </AnimatedPressable>
  );
};
