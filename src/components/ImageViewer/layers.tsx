import { View } from "@tarojs/components";
import { useSyncExternalStore } from "react";

import { XIcon } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { clamp } from "./geometry";
import { ViewerPage } from "./page";
import type { OverlayProps, useViewerOverlayModel } from "./use-overlay-model";

export const ViewerPictures = ({
  model,
  props,
}: {
  model: ReturnType<typeof useViewerOverlayModel>;
  props: OverlayProps;
}) => {
  const f = useSyncExternalStore(
    model.motion.signal.subscribe,
    model.motion.signal.getSnapshot,
    model.motion.signal.getSnapshot
  );
  return (
    <View
      aria-hidden
      className="absolute inset-0"
      style={{
        pointerEvents: "none",
        transform: `translateX(${f.pagerX * model.direction * 2}rpx)`,
      }}
    >
      {model.items.map((item, at) =>
        Math.abs(at - model.page) <= 1 ? (
          <ViewerPage
            key={item.id}
            item={item}
            at={at}
            model={model}
            cornerRadius={props.cornerRadius}
          />
        ) : null
      )}
    </View>
  );
};
export const ViewerBackdrop = ({
  model,
}: {
  model: ReturnType<typeof useViewerOverlayModel>;
}) => {
  const f = useSyncExternalStore(
    model.motion.signal.subscribe,
    model.motion.signal.getSnapshot,
    model.motion.signal.getSnapshot
  );
  return (
    <View
      aria-hidden
      className="absolute inset-0 bg-black/60"
      style={{ opacity: clamp(f.t, 0, 1) * f.fade, pointerEvents: "none" }}
    />
  );
};
export const ViewerChrome = ({
  model,
  props,
}: {
  model: ReturnType<typeof useViewerOverlayModel>;
  props: OverlayProps;
}) => {
  const f = useSyncExternalStore(
    model.motion.signal.subscribe,
    model.motion.signal.getSnapshot,
    model.motion.signal.getSnapshot
  );
  const color = useThemeToken("foreground");
  return (
    <View
      className="absolute inset-0"
      style={{
        opacity: f.chrome * clamp(f.t, 0, 1) * f.fade,
        pointerEvents: "none",
      }}
    >
      <View
        className="absolute inset-x-[32px] flex flex-row items-center justify-between"
        style={{ top: `${(model.metrics.insets.top + 8) * 2}rpx` }}
      >
        {props.showClose ? (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={props.closeLabel}
            hitSlop={8}
            disabled={!props.open}
            onPress={props.onRequestClose}
            pressScale={1}
            className="flex h-[80px] w-[80px] items-center justify-center rounded-full bg-[var(--panel-background)]/80"
            style={{
              pointerEvents: props.open && f.chrome > 0.5 ? "auto" : "none",
            }}
          >
            <XIcon size={18} color={color} />
          </AnimatedPressable>
        ) : (
          <View className="h-[80px] w-[80px]" />
        )}
        {model.count > 1 ? (
          <View
            aria-hidden
            className="rounded-full bg-[var(--panel-background)]/80 px-[24px] py-[12px]"
          >
            <Text
              size="sm"
              weight="medium"
              className="text-[var(--panel-foreground)] tabular-nums"
            >{`${model.page + 1} of ${model.count}`}</Text>
          </View>
        ) : null}
        <View className="h-[80px] w-[80px]" />
      </View>
      {model.item?.caption !== undefined && model.item?.caption !== null ? (
        <View
          className="absolute inset-x-[32px] rounded-[var(--panel-radius-2xl)] bg-[var(--panel-background)]/80 px-[32px] py-[24px]"
          style={{ bottom: `${(model.metrics.insets.bottom + 16) * 2}rpx` }}
        >
          {textChildren(model.item.caption, (text) => (
            <Text size="sm" className="text-[var(--panel-foreground)]">
              {text}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
};
