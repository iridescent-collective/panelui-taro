import { ScrollView, View } from "@tarojs/components";
import {
  forwardRef,
  useContext,
  useEffect,
  useId,
  useSyncExternalStore,
} from "react";
import type { ComponentRef } from "react";

import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import { SheetSizedContext, SheetSurfaceContext } from "./context";
import { SheetSurfaceStore } from "./surface-store";
import type { BottomSheetBodyProps } from "./types";

const FALLBACK_SURFACE = new SheetSurfaceStore();
export const BottomSheetBody = forwardRef<
  ComponentRef<typeof ScrollView>,
  BottomSheetBodyProps
>(
  (
    {
      className,
      children,
      onScroll,
      overScrollMode = "never",
      scrollTop,
      scrollY,
      contentContainerClassName,
      ...props
    },
    ref
  ) => {
    const surface = useContext(SheetSurfaceContext);
    const sized = useContext(SheetSizedContext);
    const owner = useId();
    const { scale } = useWindowMetrics();
    const holdStore = surface ?? FALLBACK_SURFACE;
    const hold = useSyncExternalStore(
      holdStore.subscribe,
      holdStore.getSnapshot,
      holdStore.getSnapshot
    );
    useEffect(() => surface?.register(owner), [owner, surface]);
    return (
      <ScrollView
        {...props}
        ref={ref}
        enhanced
        scrollY={hold === undefined && (scrollY ?? true)}
        scrollTop={hold === undefined ? scrollTop : hold / scale}
        bounces={overScrollMode !== "never"}
        showScrollbar={false}
        className={cn(
          "min-h-0",
          sized ? "h-0 flex-1" : "shrink grow-0",
          className
        )}
        onScroll={(event) => {
          if (surface) {
            surface.offset =
              surface.getSnapshot() ?? event.detail.scrollTop * scale;
          }
          onScroll?.(event);
        }}
      >
        <View className={cn("flex flex-col", contentContainerClassName)}>
          {textChildren(children)}
        </View>
      </ScrollView>
    );
  }
);
