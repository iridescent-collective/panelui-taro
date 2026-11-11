import { View } from "@tarojs/components";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactElement, ReactNode } from "react";

import { useDirection } from "../../hooks/use-direction";
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { BottomSheet } from "../BottomSheet";
import { Text } from "../primitives/Text";
import { AIInputSheetContext, useAIInputSheet } from "./context";
import type { AIInputSheetContextValue } from "./context";
import { AIInputSheetBody } from "./sheet-body";
import { Glass, useInputInsets } from "./surface";
import type { AIInputSheetScreenProps, AIInputSheetProps } from "./types";

type ScreenElement = ReactElement<AIInputSheetScreenProps>;
export const AIInputSheetScreen = ({
  className,
  id,
  title,
  trailing,
  children,
  ...props
}: AIInputSheetScreenProps) => {
  void id;
  void title;
  void trailing;
  return (
    <View
      {...props}
      className={cn("flex flex-col gap-[32px] pb-[16px]", className)}
    >
      {children}
    </View>
  );
};
export const screensOf = (children: ReactNode): ScreenElement[] =>
  Children.toArray(children).filter(
    (child): child is ScreenElement =>
      isValidElement(child) && child.type === AIInputSheetScreen
  );
export const AIInputSheetHeader = ({
  depth,
  title,
  trailing,
}: {
  depth: number;
  title?: ReactNode;
  trailing?: ReactNode;
}) => {
  const { pop, close } = useAIInputSheet("AIInput.Sheet");
  const rtl = useDirection() === "rtl";
  const nested = depth > 1;
  const Back = rtl ? ChevronRightIcon : ChevronLeftIcon;
  return (
    <View className="relative flex h-[88px] flex-row items-center">
      <Glass
        variant="clear"
        radius={17}
        fallbackClassName="bg-[var(--panel-muted)]"
        style={{ height: "68rpx", width: "68rpx" }}
      >
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={nested ? "Back" : "Close"}
          onPress={nested ? pop : close}
          className="flex h-full w-full flex-col items-center justify-center"
        >
          {nested ? <Back size={20} /> : <XIcon size={18} />}
        </AnimatedPressable>
      </Glass>

      <View
        aria-hidden
        className="pointer-events-none absolute inset-x-[0px] flex flex-col items-center"
      >
        {typeof title === "string" ? (
          <Text size="xl" weight="semibold" numberOfLines={1}>
            {title}
          </Text>
        ) : (
          title
        )}
      </View>

      <View className="flex flex-1 flex-col" />
      {trailing}
    </View>
  );
};
export const AIInputSheet = ({
  children,
  className,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  initialScreen,
  onScreenChange,
  blur = false,
  size = "auto",
  detached = true,
}: AIInputSheetProps) => {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : internalOpen;
  const screens = screensOf(children);
  const rootId = initialScreen ?? screens[0]?.props.id ?? "";
  const [stack, setStack] = useState<string[]>(rootId ? [rootId] : []);
  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );
  useEffect(() => {
    if (!open && rootId) {
      setStack([rootId]);
    }
  }, [open, rootId]);
  const push = useCallback(
    (id: string) => {
      setStack((current) =>
        current.at(-1) === id ? current : [...current, id]
      );
      onScreenChange?.(id);
    },
    [onScreenChange]
  );
  const pop = useCallback(() => {
    setStack((current) => {
      if (current.length <= 1) {
        return current;
      }
      const next = current.slice(0, -1);
      const top = next.at(-1);
      if (top) {
        onScreenChange?.(top);
      }
      return next;
    });
  }, [onScreenChange]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const context = useMemo<AIInputSheetContextValue>(
    () => ({ close, pop, push, stack }),
    [stack, push, pop, close]
  );
  const activeId = stack.at(-1);
  const active =
    screens.find((screen) => screen.props.id === activeId) ?? screens[0];
  const depth = stack.length;
  const insets = useInputInsets();
  if (!active) {
    return null;
  }
  return (
    <BottomSheet open={open} onOpenChange={setOpen}>
      <BottomSheet.Content
        blur={blur}
        size={size}
        detached={detached}
        showClose={false}
        showGrabber={false}
        className="border-[0px] border-solid bg-transparent px-[0px] pt-[0px] shadow-none"
        style={{ paddingBottom: 0 }}
      >
        <AIInputSheetContext.Provider value={context}>
          <View
            className={cn(
              "flex flex-col overflow-hidden border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] px-[32px] pt-[16px]",
              detached
                ? "rounded-[var(--panel-radius-3xl)]"
                : "rounded-t-[var(--panel-radius-3xl)] border-b-[0px] border-solid"
            )}
            style={{
              paddingBottom: `${(detached ? 16 : Math.max(insets.bottom, 16)) * 2}rpx`,
            }}
          >
            <View className="mb-[16px] self-center">
              <View className="h-[8px] w-[80px] rounded-full bg-[var(--panel-muted-foreground-opacity-40)]" />
            </View>
            <AIInputSheetHeader
              depth={depth}
              title={active.props.title}
              trailing={active.props.trailing}
            />
            <AIInputSheetBody
              activeId={activeId}
              depth={depth}
              className={className}
            >
              {active}
            </AIInputSheetBody>
          </View>
        </AIInputSheetContext.Provider>
      </BottomSheet.Content>
    </BottomSheet>
  );
};
