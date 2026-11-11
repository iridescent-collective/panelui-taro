import { View } from "@tarojs/components";
import { useMemo, useState } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useTimingNumber } from "../../hooks/use-timing-number";
import { ChevronRightIcon } from "../../icons";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { MenuSubContext, useMenuSub } from "./context";
import { MenuItem } from "./item";
import type {
  MenuSubProps,
  MenuSubTriggerProps,
  MenuSubContentProps,
} from "./types";

export const MenuSub = ({
  children,
  defaultOpen = false,
  open,
  onOpenChange,
}: MenuSubProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const resolved = open ?? internalOpen;
  const context = useMemo(
    () => ({
      open: resolved,
      toggle: () => {
        if (open === undefined) {
          setInternalOpen(!resolved);
        }
        onOpenChange?.(!resolved);
      },
    }),
    [open, resolved, onOpenChange]
  );
  return (
    <MenuSubContext.Provider value={context}>
      {children}
    </MenuSubContext.Provider>
  );
};
export const MenuSubTrigger = ({
  className,
  children,
  icon,
  onSelect,
  ...props
}: MenuSubTriggerProps) => {
  const { open, toggle } = useMenuSub("Menu.SubTrigger");
  const sign = useDirectionSign();
  const reduced = usePanelReducedMotion();
  const progress = useTimingNumber(open ? 1 : 0, 180, reduced);
  const tint = useThemeToken("muted-foreground");
  return (
    <MenuItem
      {...props}
      accessibilityState={{ disabled: props.disabled ?? false, expanded: open }}
      closeOnSelect={false}
      icon={icon}
      className={className}
      trailing={
        <View
          className="relative"
          style={{ transform: `rotate(${progress * 90 * sign}deg)` }}
        >
          <ChevronRightIcon size={16} strokeWidth={2} color={tint} />
        </View>
      }
      onSelect={() => {
        toggle();
        onSelect?.();
      }}
    >
      {children}
    </MenuItem>
  );
};
export const MenuSubContent = ({
  className,
  children,
  style,
  ...props
}: MenuSubContentProps) => {
  const { open } = useMenuSub("Menu.SubContent");
  const reduced = usePanelReducedMotion();
  const content = useMemo(
    () => ({ children, className, style }),
    [children, className, style]
  );
  const measurement = useElementLayout(true, content, props.id);
  const progress = useTimingNumber(open ? 1 : 0, 200, reduced);
  return (
    <View
      aria-hidden={!open}
      className="relative overflow-hidden"
      style={{
        height: `${progress * (measurement.layout?.height ?? 0) * 2}rpx`,
        opacity: progress,
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <View
        {...props}
        id={measurement.id}
        style={mergeStyle(
          { left: 0, position: "absolute", right: 0, top: 0 },
          style
        )}
        className={cn(
          "ms-[32px] flex flex-col gap-[4px] border-s-[2px] border-solid border-[color:var(--panel-border)] ps-[8px]",
          className
        )}
      >
        {children}
      </View>
    </View>
  );
};
MenuSub.displayName = "Menu.Sub";
MenuSubTrigger.displayName = "Menu.SubTrigger";
MenuSubContent.displayName = "Menu.SubContent";
