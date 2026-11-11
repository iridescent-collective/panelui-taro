import { useContext, useEffect, useId } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { textChildren, textLabel, Text } from "../primitives/Text";
import { TabsListContext, useTabs } from "./context";
import { ExpandingLabel } from "./expanding-trigger";
import type { TabsTriggerProps, TabsSize } from "./types";
import { tabsVariants } from "./variants";

const HIT_SLOP: Partial<Record<TabsSize, { top: number; bottom: number }>> = {
  sm: { bottom: 8, top: 8 },
  xs: { bottom: 12, top: 12 },
};
export const TabsTrigger = ({
  className,
  activeClassName,
  labelClassName,
  activeLabelClassName,
  value,
  icon,
  badge,
  disabled = false,
  children,
  onClick,
  pressScale,
  ...hostProps
}: TabsTriggerProps) => {
  const context = useTabs("Tabs.Trigger");
  const list = useContext(TabsListContext);
  const id = `panelui-tab-${useId().replaceAll(":", "")}`;
  const reduced = usePanelReducedMotion();
  const active = context.value === value;
  const expanding = context.variant === "expanding";
  const slots = tabsVariants({
    active,
    disabled,
    scrollable: list.scrollable,
    size: context.size,
    variant: context.variant,
  });
  const { unregisterLayout } = context;
  useEffect(() => {
    const release = list.registerTrigger?.(value, id);
    return () => {
      release?.();
      unregisterLayout(value);
    };
  }, [id, list.registerTrigger, unregisterLayout, value]);
  const labelClasses = cn(
    slots.label(),
    labelClassName,
    active && activeLabelClassName
  );
  const label = expanding ? (
    <ExpandingLabel
      active={active}
      still={reduced || context.animationDisabled}
      className={labelClasses}
    >
      {children}
    </ExpandingLabel>
  ) : (
    textChildren(children, (text) => (
      <Text size="sm" weight="medium" className={labelClasses}>
        {text}
      </Text>
    ))
  );
  return (
    <AnimatedPressable
      {...hostProps}
      data-state={active ? "active" : "inactive"}
      pressScale={pressScale}
      id={id}
      accessibilityRole="tab"
      accessibilityLabel={expanding ? textLabel(children) : undefined}
      accessibilityState={{ disabled, selected: active }}
      disabled={disabled}
      hitSlop={HIT_SLOP[context.size]}
      onPress={(event) => {
        context.setValue(value);
        onClick?.(event);
      }}
      className={cn(
        "flex",
        slots.trigger(),
        expanding && "relative flex-row items-center",
        !expanding && (icon || badge) && "flex-row gap-[12px]",
        className,
        active && activeClassName
      )}
    >
      {icon}
      {label}
      {badge}
    </AnimatedPressable>
  );
};
