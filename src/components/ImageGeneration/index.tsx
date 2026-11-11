import { View } from "@tarojs/components";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { RotateCcwIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Text } from "../primitives/Text";
import {
  FIELD_OPACITY,
  MEDIA_OPACITY,
  MEDIA_SCALE,
  STATUS_TEXT,
} from "./constants";
import { ImageGenerationField } from "./field";
import { StatusMark } from "./status-mark";
import type { ImageGenerationProps } from "./types";
import { imageGenerationVariants } from "./variants";

export type {
  ImageGenerationProps,
  ImageGenerationFieldProps,
  ImageGenerationStatus,
} from "./types";
const ImageGenerationRoot = ({
  className,
  status = "generating",
  label,
  prompt,
  resolution = "1024 × 1024",
  aspectRatio = 1,
  size = "compact",
  animation = "drift",
  statusText,
  showStatus = true,
  onRetry,
  frameClassName,
  mediaClassName,
  statusClassName,
  children,
  ...props
}: ImageGenerationProps) => {
  const reduced = usePanelReducedMotion();
  const working =
    status === "queued" || status === "generating" || status === "refining";
  const slots = imageGenerationVariants({ error: status === "error", size });
  const sentence = statusText ?? STATUS_TEXT[status];
  const transition = reduced
    ? "none"
    : "opacity 400ms ease-in-out, transform 400ms ease-in-out";
  return (
    <View {...props} className={cn(slots.root(), "flex flex-col", className)}>
      <View
        role="img"
        aria-role="image"
        aria-label={label ?? (prompt ? `${sentence}: ${prompt}` : sentence)}
        aria-busy={working}
        style={{ aspectRatio }}
        className={slots.frame({ className: frameClassName })}
      >
        <View
          aria-hidden={working}
          className={cn(slots.media(), mediaClassName)}
          style={{
            opacity: MEDIA_OPACITY[status],
            transform: `scale(${MEDIA_SCALE[status]})`,
            transition,
          }}
        >
          {children}
        </View>
        <View
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            opacity: FIELD_OPACITY[status],
            transition: reduced ? "none" : "opacity 400ms ease-in-out",
          }}
        >
          <ImageGenerationField paused={!working} animation={animation} />
        </View>
        {resolution ? (
          <Text className={slots.resolution()}>{resolution}</Text>
        ) : null}
      </View>
      {showStatus ? (
        <View
          aria-live="polite"
          className={slots.status({ className: statusClassName })}
        >
          <StatusMark status={status} />
          <Text className={slots.statusText()}>{sentence}</Text>
        </View>
      ) : null}
      {prompt ? (
        <Text numberOfLines={1} className={slots.prompt()}>
          {prompt}
        </Text>
      ) : null}
      {status === "error" && onRetry ? (
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Try again"
          pressScale={1}
          pressOpacity={1}
          onPress={onRetry}
          className={slots.retry()}
        >
          <RotateCcwIcon size={16} />
          <Text className={slots.retryLabel()}>Try again</Text>
        </AnimatedPressable>
      ) : null}
    </View>
  );
};
export const ImageGeneration = Object.assign(ImageGenerationRoot, {
  Field: ImageGenerationField,
});
