import { forwardRef } from "react";

import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { BottomSheet, bottomSheetDetentHeight } from "../BottomSheet";
import { SketchRoot } from "./root";
import type { SketchHandle, SketchSheetProps } from "./types";

export const SketchSheet = forwardRef<SketchHandle, SketchSheetProps>(
  (
    {
      open,
      onOpenChange,
      native = true,
      onClose,
      onDone,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const { height, insets } = useWindowMetrics();
    const detent = bottomSheetDetentHeight(["full"], height);
    const nativeHeight = detent
      ? detent - Math.max(insets.bottom, 16)
      : undefined;
    const size =
      native && nativeHeight
        ? { flex: "0 0 auto", height: `${nativeHeight * 2}rpx` }
        : {};
    const rootStyle =
      typeof style === "string"
        ? `${native && nativeHeight ? `height:${nativeHeight * 2}rpx;flex:0 0 auto;` : ""}${style}`
        : { ...size, ...style };
    return (
      <BottomSheet
        open={open}
        onOpenChange={onOpenChange}
        native={native}
        nativeBackground={native}
        snapPoints={native ? ["full"] : undefined}
      >
        <BottomSheet.Content
          size="full"
          dismissible={false}
          showClose={false}
          showGrabber={false}
          className="px-0 pt-0 pb-0"
        >
          <SketchRoot
            ref={ref}
            {...props}
            className={className}
            style={rootStyle}
            onClose={() => {
              onClose?.();
              onOpenChange?.(false);
            }}
            onDone={
              onDone
                ? (result) => {
                    onDone(result);
                    onOpenChange?.(false);
                  }
                : undefined
            }
          />
        </BottomSheet.Content>
      </BottomSheet>
    );
  }
);
SketchSheet.displayName = "Sketch.Sheet";
