import { Canvas, View } from "@tarojs/components";
import { forwardRef } from "react";

import { cn } from "../../lib/utils";
import { SketchCards, SketchHeader, SketchPalette } from "./controls";
import { SketchFallback } from "./drawing";
import { SizeSlider } from "./size-slider";
import type { SketchHandle, SketchProps } from "./types";
import { useSketchModel } from "./use-model";

export type {
  SketchTool,
  SketchShape,
  SketchItem,
  SketchResult,
  SketchHandle,
  SketchProps,
  SketchSheetProps,
} from "./types";
export const SketchRoot = forwardRef<SketchHandle, SketchProps>(
  (props, ref) => {
    const m = useSketchModel(props, ref);
    return (
      <View
        {...m.props}
        className={cn(
          "flex min-h-0 flex-1 flex-col bg-[var(--panel-popover)]",
          m.className
        )}
      >
        <SketchHeader model={m} />
        <View className="relative isolate min-h-0 flex-1">
          <View
            id={m.layout.id}
            className="relative z-0 h-full w-full overflow-hidden"
            aria-role="image"
            aria-label={
              m.items.length
                ? `Drawing canvas, ${m.items.length} marks`
                : "Drawing canvas, empty"
            }
            aria-description="Drag to draw with the selected tool."
          >
            {m.canvas.fallback || m.card !== null ? (
              <SketchFallback frozen={m.card === null} svg={m.fallbackSVG} />
            ) : null}
            <Canvas
              id={m.canvasId}
              type="2d"
              disableScroll
              className={cn(
                "absolute h-full w-full",
                m.card === null && "inset-0"
              )}
              style={
                m.card === null
                  ? { opacity: m.canvas.fallback ? 0 : 1 }
                  : { left: "-10000px", top: "-10000px", opacity: 0 }
              }
              onTouchStart={m.card === null ? m.start : undefined}
              onTouchMove={m.card === null ? m.move : undefined}
              onTouchEnd={m.card === null ? m.finish : undefined}
              onTouchCancel={m.card === null ? m.finish : undefined}
            />
            <Canvas
              id={m.exportId}
              type="2d"
              aria-hidden
              className="absolute h-full w-full"
              style={{
                left: "-10000px",
                pointerEvents: "none",
                top: "-10000px",
              }}
            />
          </View>
          <SizeSlider
            value={m.size}
            min={m.minSize}
            max={m.maxSize}
            color={m.tool === "eraser" ? m.mutedColor : m.ink}
            scale={m.tool === "eraser" ? 2.5 : 1}
            onChange={m.setSize}
          />
          <SketchCards model={m} />
        </View>
        <SketchPalette model={m} />
      </View>
    );
  }
);
SketchRoot.displayName = "Sketch";
