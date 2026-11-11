import { View } from "@tarojs/components";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { cn } from "../../lib/utils";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { useSwipePan } from "./use-pan";

export const SwipeMovingRow = ({
  signal,
  sign,
  pan,
  className,
  children,
}: {
  signal: ObservableNumber;
  sign: number;
  pan: ReturnType<typeof useSwipePan>;
  className?: string;
  children: ReactNode;
}) => {
  const offset = useSyncExternalStore(
    signal.subscribe,
    signal.getSnapshot,
    signal.getSnapshot
  );
  return (
    <View
      className={cn("panel-swipe-row w-full", className)}
      style={{ transform: `translateX(${offset * sign * 2}rpx)` }}
      catchMove={pan.active}
      onTouchStart={pan.onTouchStart}
      onTouchMove={pan.onTouchMove}
      onTouchEnd={pan.onTouchEnd}
      onTouchCancel={pan.onTouchCancel}
    >
      {children}
    </View>
  );
};
export const SwipePanelLayer = ({
  signal,
  side,
  fill,
  id,
  children,
}: {
  signal: ObservableNumber;
  side: "start" | "end";
  fill: string;
  id: string;
  children: ReactNode;
}) => {
  const offset = useSyncExternalStore(
    signal.subscribe,
    signal.getSnapshot,
    signal.getSnapshot
  );
  const width = Math.max(side === "start" ? offset : -offset, 0);
  return (
    <View
      aria-hidden={width === 0}
      className={cn(
        "absolute top-0 bottom-0 overflow-hidden",
        side === "start" ? "start-0" : "end-0",
        fill
      )}
      style={{ width: `${width * 2}rpx` }}
    >
      <View
        id={id}
        className={cn(
          "panel-swipe-tiles absolute top-0 bottom-0 flex w-max flex-row items-stretch",
          side === "start"
            ? "panel-swipe-start end-0"
            : "panel-swipe-end start-0"
        )}
      >
        {children}
      </View>
    </View>
  );
};
