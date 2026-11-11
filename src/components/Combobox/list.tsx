import { ScrollView, View } from "@tarojs/components";
import { useEffect, useSyncExternalStore } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useChartTween } from "../../primitives/chart-tween";
import { Portal } from "../../primitives/portal";
import { ComboboxContext } from "./context";
import { comboboxBody } from "./list-body";
import { comboboxCatchers, comboboxPosition } from "./math";
import type { ComboboxMode, ComboboxProps } from "./types";
import type { useComboboxModel } from "./use-model";
import { comboboxVariants } from "./variants";

export const ComboboxList = <Mode extends ComboboxMode>({
  props,
  model,
}: {
  props: ComboboxProps<Mode>;
  model: ReturnType<typeof useComboboxModel<Mode>>;
}) => {
  const {
    presentation = "overlay",
    offset = 8,
    contentWidth = "field",
    listClassName,
  } = props;
  const slots = comboboxVariants({ presentation });
  const reduced = usePanelReducedMotion();
  const fade = useChartTween(0);
  const fadeDuration = model.open ? 140 : 120;
  useEffect(() => {
    fade.timingTo(model.open ? 1 : 0, reduced ? 0 : fadeDuration);
  }, [model.open, reduced, fade.timingTo, fadeDuration]);
  const opacity = useSyncExternalStore(
    fade.signal.subscribe,
    fade.signal.getSnapshot,
    fade.signal.getSnapshot
  );
  const body = comboboxBody(props, model);
  const natural = useElementLayout(true, body, undefined, false);
  const below = model.anchor
    ? model.screenHeight -
      model.keyboardHeight -
      (model.anchor.y + model.anchor.height) -
      offset
    : 0;
  useEffect(() => {
    if (
      presentation !== "overlay" ||
      model.flipped !== null ||
      !natural.layout
    ) {
      return;
    }
    model.setFlipped(natural.layout.height + 16 > below);
  }, [presentation, model.flipped, natural.layout, below]);
  const maximum =
    presentation === "inline"
      ? 320
      : Math.max(
          (model.flipped ? (model.anchor?.y ?? 0) : below) - offset,
          160
        );
  const height = Math.min(
    maximum,
    natural.layout ? natural.layout.height + 16 : maximum
  );
  const list = (
    <View
      className={cn(slots.list(), "flex flex-col", listClassName)}
      style={{
        height: `${height * 2}rpx`,
        opacity,
        pointerEvents: model.open ? "auto" : "none",
      }}
    >
      <ScrollView
        scrollY
        showScrollbar={false}
        style={{ height: "100%" }}
        onTouchStart={model.onListStart}
        onTouchEnd={model.onListEnd}
        onTouchCancel={model.onListSettled}
        onScrollEnd={model.onListSettled}
      >
        <View id={natural.id} className="flex flex-col gap-[8px]">
          {body}
        </View>
      </ScrollView>
    </View>
  );
  if (presentation === "inline") {
    return list;
  }
  if (!model.anchor) {
    return null;
  }
  return (
    <Portal>
      {comboboxCatchers(model.anchor).map((style, index) => (
        <AnimatedPressable
          key={index}
          aria-hidden
          onPress={() => {
            model.close();
            model.setFocusInput(false);
          }}
          style={{ ...style, position: "fixed" }}
          pressScale={1}
        />
      ))}
      <ComboboxContext.Provider
        value={{ onSelect: model.select, values: model.values }}
      >
        <View
          style={comboboxPosition(
            model.anchor,
            model.screenHeight,
            model.keyboardHeight,
            offset,
            model.flipped ?? false,
            contentWidth
          )}
        >
          {list}
        </View>
      </ComboboxContext.Provider>
    </Portal>
  );
};
