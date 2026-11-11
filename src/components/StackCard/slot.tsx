import { View } from "@tarojs/components";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { StackCardSlotIndex, useStackCardContext } from "./context";
import { depthOpacity, effectiveDepth, tiltAngle } from "./geometry";
import type { StackCardLayout } from "./types";

export const StackCardSlot = ({
  cardIndex,
  depth,
  layout,
  children,
}: {
  cardIndex: number;
  depth: number;
  layout: StackCardLayout;
  children: ReactNode;
}) => {
  const { signal, disabled } = useStackCardContext();
  const frame = useSyncExternalStore(
    signal.subscribe,
    signal.getSnapshot,
    signal.getSnapshot
  );
  const distance = cardIndex - frame.active;
  let opacity = 0;
  let zIndex = 0;
  let x = 0;
  let y = 0;
  let rotate = 0;
  let scale = 1;
  if (distance === 0) {
    opacity = frame.fade;
    zIndex = 200;
    ({ x } = frame);
    ({ y } = frame);
    rotate = tiltAngle(x, frame.width, 14, frame.pivot);
  }
  if (distance > 0) {
    const behind = effectiveDepth(distance, frame.release);
    opacity = depthOpacity(behind, depth);
    zIndex = Math.round(100 - behind * 10);
    if (layout === "flat") {
      if (behind >= 1) {
        opacity = 0;
      }
    } else if (layout === "fan") {
      const side = cardIndex % 2 === 0 ? 1 : -1;
      x = side * behind * 10;
      y = behind * 14 * 0.35;
      rotate = side * behind * 4;
      scale = 1 - behind * 0.055 * 0.6;
    } else {
      y = behind * 14;
      scale = 1 - behind * 0.055;
    }
  }
  return (
    <View
      className="absolute inset-0"
      aria-hidden={distance !== 0}
      style={{
        opacity,
        pointerEvents: distance === 0 && !disabled ? "auto" : "none",
        transform: `translateX(${x * 2}rpx) translateY(${y * 2}rpx) rotate(${rotate}deg) scale(${scale})`,
        zIndex,
      }}
    >
      <StackCardSlotIndex.Provider value={cardIndex}>
        {children}
      </StackCardSlotIndex.Provider>
    </View>
  );
};
