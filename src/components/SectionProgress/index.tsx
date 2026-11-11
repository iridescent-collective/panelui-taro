import { View } from "@tarojs/components";

import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import { SectionProgressContext } from "./context";
import { SectionProgressItem } from "./item";
import { SectionProgressList } from "./list";
import { SectionProgressRing } from "./ring";
import type { SectionProgressProps } from "./types";
import { useSectionProgressModel } from "./use-model";

export type {
  SectionProgressProps,
  SectionProgressScroll,
  SectionProgressPlacement,
  SectionProgressColor,
  SectionProgressItemProps,
} from "./types";

const SectionProgressRoot = (props: SectionProgressProps) => {
  const {
    className,
    scroll: _scroll,
    progress: _progress,
    value: _value,
    defaultValue: _defaultValue,
    onValueChange: _onValueChange,
    open: _open,
    defaultOpen: _defaultOpen,
    onOpenChange: _onOpenChange,
    placement: _placement,
    offset = 16,
    revealAt: _revealAt,
    haptics: _haptics,
    label = "Sections",
    children,
    style,
    ...native
  } = props;
  const {
    state,
    reading,
    reduced,
    insets,
    tokens,
    active,
    animatedTint,
    radius,
    atTop,
    align,
    context,
    activeLabel,
  } = useSectionProgressModel(props);
  const list = state.open ? (
    <SectionProgressList reduced={reduced}>{children}</SectionProgressList>
  ) : null;
  return (
    <SectionProgressContext.Provider value={context}>
      <View
        {...native}
        className={cn("flex flex-col", align, className)}
        aria-hidden={!reading.revealed}
        style={mergeStyleAfter(
          style ?? {
            inset: 0,
            justifyContent: atTop ? "flex-start" : "flex-end",
            paddingBottom: `${(insets.bottom + offset) * 2}rpx`,
            paddingLeft: `${(insets.left + offset) * 2}rpx`,
            paddingRight: `${(insets.right + offset) * 2}rpx`,
            paddingTop: `${(insets.top + offset) * 2}rpx`,
            position: "absolute",
          },
          { pointerEvents: "none" }
        )}
      >
        {state.open ? (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Close"
            disabled={!reading.revealed}
            pressScale={1}
            pressOpacity={1}
            onPress={state.close}
            style={{
              bottom: `${-(insets.bottom + offset) * 2}rpx`,
              left: `${-(insets.left + offset) * 2}rpx`,
              pointerEvents: reading.revealed ? "auto" : "none",
              position: "absolute",
              right: `${-(insets.right + offset) * 2}rpx`,
              top: `${-(insets.top + offset) * 2}rpx`,
            }}
          />
        ) : null}
        <View
          className="relative border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] shadow-lg"
          style={{
            borderRadius: `${radius * 2}rpx`,
            maxWidth: "86%",
            minWidth: state.open ? "360rpx" : undefined,
            opacity: reading.shown,
            pointerEvents: reading.revealed ? "auto" : "none",
            transform: `translateY(${(1 - reading.shown) * (atTop ? -20 : 20)}rpx)`,
          }}
        >
          <View
            aria-hidden
            style={{
              backgroundColor: animatedTint,
              borderRadius: `${(radius - 1) * 2}rpx`,
              inset: 0,
              opacity: 0.09,
              pointerEvents: "none",
              position: "absolute",
            }}
          />
          {atTop ? null : list}
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={
              activeLabel
                ? `${label}. ${activeLabel}. ${reading.percent}% read.`
                : label
            }
            accessibilityState={{ expanded: state.open }}
            disabled={!reading.revealed}
            onPress={() => state.setOpen(!state.open)}
            pressScale={1}
            pressOpacity={1}
            className="flex flex-row items-center gap-[20px] py-[12px] ps-[16px] pe-[32px]"
          >
            <View aria-hidden>
              <SectionProgressRing
                fill={reading.filled}
                tint={animatedTint}
                track={tokens.muted}
              />
            </View>
            <Text
              aria-hidden
              numberOfLines={1}
              className="text-[28px] font-medium"
              style={{ color: animatedTint }}
            >
              {active?.children}
            </Text>
          </AnimatedPressable>
          {atTop ? list : null}
        </View>
      </View>
    </SectionProgressContext.Provider>
  );
};
SectionProgressRoot.displayName = "SectionProgress";
export const SectionProgress = Object.assign(SectionProgressRoot, {
  Item: SectionProgressItem,
});
