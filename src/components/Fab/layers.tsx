import { View } from "@tarojs/components";
import { cloneElement } from "react";
import type { ReactElement } from "react";

import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import { FAB_MENU } from "./constants";
import { useFabGroup } from "./context";
import {
  fabMenuOrigin,
  fabMenuScale,
  fabSettled,
  fabSlotProgress,
} from "./math";
import type { FabGroupProps } from "./types";

export type FabChild = ReactElement<Pick<AnimatedPressableProps, "onPress">>;
export const FabRotation = ({ children }: { children?: React.ReactNode }) => {
  const { progress } = useFabGroup();
  return (
    <View style={{ transform: `rotate(${progress * 45}deg)` }}>{children}</View>
  );
};
export const FabSlot = ({
  index,
  child,
  separator = false,
}: {
  index: number;
  child: FabChild;
  separator?: boolean;
}) => {
  const { progress, count, close } = useFabGroup();
  const t = fabSlotProgress(progress, count, index);
  const wrapped = child.props.onPress
    ? cloneElement(child, {
        onPress: (event) => {
          close();
          child.props.onPress?.(event);
        },
      })
    : child;
  return (
    <View
      aria-hidden={progress <= 0}
      style={{
        opacity: fabSettled(t),
        transform: `translateY(${(1 - t) * 24}rpx)`,
        transformOrigin: "bottom right",
        pointerEvents: progress <= 0 ? "none" : "auto",
      }}
    >
      {separator ? (
        <View className="mx-[32px] h-[2px] bg-[var(--panel-border)]" />
      ) : null}
      {wrapped}
    </View>
  );
};
export const FabMenu = ({
  actions,
  placement = "bottom-right",
  menuWidth,
  menuRadius,
  menuClassName,
}: Pick<
  FabGroupProps,
  "placement" | "menuWidth" | "menuRadius" | "menuClassName"
> & { actions: FabChild[] }) => {
  const { progress, appearance, size } = useFabGroup();
  const metrics = FAB_MENU[appearance];
  const width = menuWidth ?? metrics.width;
  return (
    <View
      style={{
        transform: `scale(${fabMenuScale(progress)})`,
        transformOrigin: fabMenuOrigin(
          placement,
          appearance,
          width,
          actions.length,
          size
        ),
      }}
    >
      <View
        className={`border border-[var(--panel-border)] bg-[var(--panel-popover)] shadow-lg ${appearance === "wells" ? "p-[12px]" : "py-[12px]"} ${menuClassName ?? ""}`}
        style={{
          borderRadius: `${(menuRadius ?? metrics.radius) * 2}rpx`,
          width: `${width * 2}rpx`,
        }}
      >
        {actions.map((child, index) => (
          <FabSlot
            key={child.key ?? index}
            index={index}
            child={child}
            separator={metrics.hairline > 0 && index > 0}
          />
        ))}
      </View>
    </View>
  );
};
