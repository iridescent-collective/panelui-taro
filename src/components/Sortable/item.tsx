import { View } from "@tarojs/components";
import { useEffect, useSyncExternalStore } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useSourceSpring } from "../../hooks/use-source-spring";
import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { DISPLACE, LIFT } from "./constants";
import { SortableItemContext, useSortableRoot } from "./context";
import { slotOffset } from "./geometry";
import type { SortableItemProps } from "./types";
import { useSortableTouch } from "./use-touch";

export const SortableItem = ({
  className,
  activeClassName,
  id,
  children,
  disabled = false,
  pinned = false,
  style,
  ...props
}: SortableItemProps) => {
  const root = useSortableRoot();
  const locked = root.disabled || disabled || pinned;
  const frame = useSyncExternalStore(
    root.signal.subscribe,
    root.signal.getSnapshot,
    root.signal.getSnapshot
  );
  const measured = useElementLayout(true, children, undefined, false);
  useEffect(() => {
    if (measured.layout) {
      root.measured(id, measured.layout.height);
    }
  }, [id, measured.layout]);
  useEffect(() => {
    root.setPinned(id, pinned);
  }, [id, pinned]);
  const touch = useSortableTouch(id, root, locked);
  const target =
    slotOffset(frame.order, id, frame.heights, root.gap) -
    slotOffset(frame.rendered, id, frame.heights, root.gap);
  const displacement = useSourceSpring(
    target,
    DISPLACE,
    root.reduced || frame.activeId === null,
    target
  );
  const lift = useSourceSpring(
    frame.activeId === id ? 1 : 0,
    LIFT,
    root.reduced,
    0
  );
  const active = frame.activeId === id;
  const index = root.indexOf(id);
  return (
    <SortableItemContext.Provider
      value={{
        disabled: locked,
        id,
        index,
        isActive: root.activeItem === id,
        touch,
      }}
    >
      <View
        {...props}
        id={measured.id}
        className={cn(
          "w-full",
          className,
          root.activeItem === id &&
            "z-10 rounded-[var(--panel-radius-xl)] bg-[var(--panel-card)] shadow-lg",
          root.activeItem === id && activeClassName
        )}
        style={mergeStyleAfter(style, {
          transform: `translateY(${(active ? frame.translate : displacement) * 2}rpx) scale(${active ? 1 + lift * 0.05 : 1})`,
        })}
        catchMove={root.activation === "longPress" && touch.active}
        onTouchStart={
          root.activation === "longPress"
            ? touch.onTouchStart
            : props.onTouchStart
        }
        onTouchMove={
          root.activation === "longPress"
            ? touch.onTouchMove
            : props.onTouchMove
        }
        onTouchEnd={
          root.activation === "longPress" ? touch.onTouchEnd : props.onTouchEnd
        }
        onTouchCancel={
          root.activation === "longPress"
            ? touch.onTouchCancel
            : props.onTouchCancel
        }
      >
        {children}
      </View>
    </SortableItemContext.Provider>
  );
};
SortableItem.displayName = "Sortable.Item";
