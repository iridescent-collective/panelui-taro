import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { SortableContext } from "./context";
import { SortableHandle } from "./handle";
import { SortableItem } from "./item";
import type { SortableProps } from "./types";
import { useSortableModel } from "./use-model";

export { useSortableItem } from "./context";
export { reorderItems } from "./geometry";
export type {
  SortableProps,
  SortableItemProps,
  SortableHandleProps,
  SortableReorderDetails,
  SortableActivation,
  SortableScrollHandle,
} from "./types";
const SortableRoot = (props: SortableProps) => {
  const {
    value: _value,
    onReorder: _onReorder,
    gap = 0,
    activation: _activation,
    longPressDelay: _delay,
    haptics: _haptics,
    disabled: _disabled,
    scrollRef: _scrollRef,
    autoscrollThreshold: _threshold,
    autoscrollSpeed: _speed,
    onDragStart: _start,
    onDragEnd: _end,
    className,
    children,
    style,
    ...nativeProps
  } = props;
  const model = useSortableModel(props);
  return (
    <SortableContext.Provider value={model}>
      <View
        {...nativeProps}
        aria-role="list"
        className={cn("flex w-full flex-col", className)}
        style={mergeStyle(gap > 0 ? { gap: `${gap * 2}rpx` } : {}, style)}
      >
        {children}
      </View>
    </SortableContext.Provider>
  );
};
export const Sortable = Object.assign(SortableRoot, {
  Handle: SortableHandle,
  Item: SortableItem,
});
