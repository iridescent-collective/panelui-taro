import { Canvas, View } from "@tarojs/components";

import { PencilIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { GraphicSnapshot } from "../../primitives/canvas-graphics";
import { Path } from "../../primitives/static-svg";
import { Text } from "../primitives/Text";
import { signatureAccessibilityValue } from "./accessibility";
import { strokePath } from "./math";
import type { useSignatureModel } from "./use-signature";

export const SignatureSurface = ({
  accessibilityHint,
  accessibilityLabel,
  adjust,
  announcement,
  canvas,
  canvasId,
  className,
  disabled,
  drawing,
  end,
  exportId,
  fallbackPath,
  finish,
  guideline,
  guidelineLabel,
  guideClassName,
  height,
  ink,
  lineWidth,
  layout,
  move,
  onRequestAlternative,
  padClassName,
  placeholder,
  placeholderClassName,
  props,
  slots,
  snapshot,
  start,
  width,
}: ReturnType<typeof useSignatureModel>) => (
  <View
    {...props}
    className={cn("flex min-h-0 flex-col", slots.root({ className }))}
  >
    <View
      id={layout.id}
      className={cn(
        "panel-signature-pad relative min-h-0",
        slots.pad({ className: padClassName })
      )}
      role="img"
      aria-role="image"
      aria-label={accessibilityLabel ?? "Signature pad"}
      aria-description={
        accessibilityHint ?? "Draw a signature. Long press for editing actions."
      }
      aria-disabled={disabled}
      aria-valuetext={signatureAccessibilityValue(snapshot.strokes.length).text}
      onLongPress={() => {
        void adjust();
      }}
    >
      {guideline && height > 0 ? (
        <View
          className={cn("flex", slots.guide({ className: guideClassName }))}
          style={{ pointerEvents: "none", top: `${height * 0.72 * 2}rpx` }}
        >
          <Text size="lg" muted>
            ✕
          </Text>
          <View className="h-[2px] flex-1 bg-[var(--panel-border)]" />
          {guidelineLabel ? (
            <Text size="xs" muted>
              {guidelineLabel}
            </Text>
          ) : null}
        </View>
      ) : null}
      {canvas.fallback ? (
        <GraphicSnapshot
          width={width}
          height={height}
          viewBox={`0 0 ${width || 1} ${height || 1}`}
        >
          {snapshot.strokes.map((points, index) => (
            <Path
              key={index}
              d={strokePath(points)}
              fill="none"
              stroke={ink}
              strokeWidth={lineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {canvas.fallback ? (
            <Path
              d={fallbackPath}
              fill="none"
              stroke={ink}
              strokeWidth={lineWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}
        </GraphicSnapshot>
      ) : null}
      <Canvas
        id={canvasId}
        type="2d"
        disableScroll={!disabled}
        className="absolute inset-0 h-full w-full"
        style={{ opacity: canvas.fallback ? 0 : 1 }}
        aria-hidden
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
        onTouchCancel={finish}
      />
      <Canvas
        id={exportId}
        type="2d"
        className="absolute h-full w-full"
        aria-hidden
        style={{ left: "-10000px", pointerEvents: "none", top: "-10000px" }}
      />
      {snapshot.strokes.length === 0 && !drawing && placeholder !== null ? (
        <View
          className={cn(
            "flex flex-col",
            slots.placeholder({ className: placeholderClassName })
          )}
          style={{ pointerEvents: "none" }}
        >
          {placeholder ?? (
            <>
              <PencilIcon size={20} />
              <Text size="sm" muted>
                Sign here
              </Text>
            </>
          )}
        </View>
      ) : null}
    </View>
    {onRequestAlternative && !disabled ? (
      <AnimatedPressable
        onPress={onRequestAlternative}
        accessibilityRole="button"
        accessibilityLabel="Use another signature method"
        className="px-[24px] py-[8px]"
      >
        <Text size="sm" muted>
          Use another signature method
        </Text>
      </AnimatedPressable>
    ) : null}
    {announcement ? (
      <Text aria-live="polite" className="sr-only">
        {announcement}
      </Text>
    ) : null}
  </View>
);
