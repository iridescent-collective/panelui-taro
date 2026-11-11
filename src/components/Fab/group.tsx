import { View } from "@tarojs/components";
import {
  Children,
  forwardRef,
  isValidElement,
  useSyncExternalStore,
} from "react";
import type { ComponentRef } from "react";

import { selectionTick } from "../../lib/haptics";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Scrim } from "../../primitives/scrim";
import { FAB_MENU } from "./constants";
import { FabContext } from "./context";
import { FabMenu, FabRotation, FabSlot } from "./layers";
import type { FabChild } from "./layers";
import { fabAlign, fabAnchor } from "./math";
import { FabRoot } from "./root";
import type { FabGroupProps } from "./types";
import { useFabModel } from "./use-model";

export const FabGroup = forwardRef<ComponentRef<typeof View>, FabGroupProps>(
  (
    {
      className,
      icon,
      label,
      children,
      open: controlled,
      onOpenChange,
      placement = "bottom-right",
      offset = 16,
      layout = "dial",
      appearance = "platform",
      iconPlacement,
      menuWidth,
      menuRadius,
      menuClassName,
      rowClassName,
      size = "md",
      variant,
      disabled = false,
      haptics = false,
      glass: _glass,
      blur = false,
      rotateOnOpen = true,
      accessibilityLabel,
      style,
      ...props
    },
    ref
  ) => {
    const { open, present, spring, setOpen, close } = useFabModel(
      controlled,
      onOpenChange
    );
    const progress = useSyncExternalStore(
      spring.signal.subscribe,
      spring.signal.getSnapshot,
      spring.signal.getSnapshot
    );
    const actions = Children.toArray(children).filter(
      isValidElement
    ) as FabChild[];
    const resolvedLayout = layout === "dial" ? "dial" : "menu";
    return (
      <>
        {open ? (
          <AnimatedPressable
            accessibilityLabel="Close"
            accessibilityRole="button"
            onPress={close}
            className="absolute inset-0"
          >
            <Scrim blur={blur} dimClassName="bg-black/32" />
          </AnimatedPressable>
        ) : null}
        <FabContext.Provider
          value={{
            appearance,
            close,
            count: actions.length,
            iconPlacement: iconPlacement ?? FAB_MENU[appearance].icon,
            layout: resolvedLayout,
            rowClassName,
            progress,
            size,
          }}
        >
          <View
            {...props}
            ref={ref}
            className={cn(
              "flex flex-col gap-[24px]",
              fabAlign(resolvedLayout, placement),
              className
            )}
            style={mergeStyle(fabAnchor(placement, offset), style)}
          >
            {present && resolvedLayout === "menu" ? (
              <FabMenu
                actions={actions}
                placement={placement}
                menuWidth={menuWidth}
                menuRadius={menuRadius}
                menuClassName={menuClassName}
              />
            ) : null}
            {present && resolvedLayout === "dial"
              ? actions.map((child, index) => (
                  <FabSlot
                    key={child.key ?? index}
                    child={child}
                    index={index}
                  />
                ))
              : null}
            <FabRoot
              icon={rotateOnOpen ? <FabRotation>{icon}</FabRotation> : icon}
              extended={Boolean(label) && !open}
              size={size}
              variant={variant}
              disabled={disabled}
              accessibilityLabel={accessibilityLabel}
              accessibilityState={{ disabled, expanded: open }}
              onPress={() => {
                if (haptics) {
                  void selectionTick();
                }
                setOpen(!open);
              }}
            >
              {label}
            </FabRoot>
          </View>
        </FabContext.Provider>
      </>
    );
  }
);
FabGroup.displayName = "Fab.Group";
