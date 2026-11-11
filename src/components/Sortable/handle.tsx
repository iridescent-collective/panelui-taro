import { View } from "@tarojs/components";
import { showActionSheet } from "@tarojs/taro";
import { useContext, useEffect, useRef } from "react";

import { GripVerticalIcon } from "../../icons";
import { IconColorProvider } from "../../icons/context";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { SortableItemContext, useSortableRoot } from "./context";
import type { SortableHandleProps } from "./types";

export const SortableHandle = ({
  className,
  children,
  accessibilityLabel = "Drag to reorder",
  onClick,
  onLongPress,
  ...props
}: SortableHandleProps) => {
  const root = useSortableRoot();
  const item = useContext(SortableItemContext);
  const tint = useThemeToken("muted-foreground");
  const locked = root.disabled || item?.disabled;
  const latest = useRef({ item, locked, root });
  latest.current = { item, locked, root };
  const mounted = useRef(true);
  const version = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      version.current += 1;
    };
  }, []);
  const menu = async () => {
    if (locked || !item) {
      return;
    }
    item.touch.onTouchCancel();
    const { id } = item;
    version.current += 1;
    const request = version.current;
    try {
      const result = await showActionSheet({
        itemList: ["Move up", "Move down"],
      });
      if (
        !mounted.current ||
        request !== version.current ||
        latest.current.locked ||
        latest.current.item?.id !== id
      ) {
        return;
      }
      if (result.tapIndex === 0) {
        latest.current.root.step(id, -1);
      }
      if (result.tapIndex === 1) {
        latest.current.root.step(id, 1);
      }
    } catch {
      return false;
    }
  };
  const active = root.activation === "handle" && item;
  return (
    <View
      {...props}
      aria-role="adjustable"
      aria-label={accessibilityLabel}
      aria-disabled={locked}
      className={cn(
        "flex items-center justify-center px-[16px] py-[12px]",
        locked && "opacity-40",
        className
      )}
      catchMove={Boolean(active && item.touch.active)}
      onTouchStart={active ? item.touch.onTouchStart : props.onTouchStart}
      onTouchMove={active ? item.touch.onTouchMove : props.onTouchMove}
      onTouchEnd={active ? item.touch.onTouchEnd : props.onTouchEnd}
      onTouchCancel={active ? item.touch.onTouchCancel : props.onTouchCancel}
      onClick={(event) => {
        onClick?.(event);
        void menu();
      }}
      onLongPress={(event) => {
        onLongPress?.(event);
        if (root.activation !== "longPress") {
          void menu();
        }
      }}
    >
      <IconColorProvider color={tint}>
        {children ?? <GripVerticalIcon size={18} />}
      </IconColorProvider>
    </View>
  );
};
SortableHandle.displayName = "Sortable.Handle";
