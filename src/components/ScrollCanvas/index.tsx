import { Image, View } from "@tarojs/components";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useRevealProgress } from "../../hooks/use-reveal-progress";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import type { ScrollCanvasProps, ScrollCanvasSource } from "./types";

export type {
  ScrollCanvasProps,
  ScrollCanvasSource,
  ScrollCanvasEffect,
} from "./types";
const readSource = (source?: ScrollCanvasSource) =>
  typeof source === "string" ? source : (source?.uri ?? "");
export const ScrollCanvas = ({
  className,
  imageClassName,
  source,
  sources,
  effect = "parallax",
  aspectRatio = 16 / 10,
  distance = 1,
  start = 1,
  end = 0.3,
  progress: external,
  enabled = true,
  style,
  ...props
}: ScrollCanvasProps) => {
  const reduced = usePanelReducedMotion();
  const reveal = useRevealProgress({
    enabled: enabled && !reduced,
    end,
    id: props.id,
    progress: external,
    start,
  });
  const frames = sources ?? (source ? [source] : []);
  const p = reveal.value;
  const transform =
    effect === "zoom"
      ? `scale(${1 + 0.12 * distance * (1 - p)})`
      : `translateY(${(1 - 2 * p) * 10 * distance}%)`;
  return (
    <View
      {...props}
      id={props.id ?? reveal.id}
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--panel-radius-2xl)] bg-[var(--panel-muted)]",
        className
      )}
      style={mergeStyle({ aspectRatio }, style)}
    >
      {effect === "sequence" ? (
        frames.map((frame, index) => (
          <View
            key={`${readSource(frame)}-${index}`}
            className="absolute inset-0"
            style={{
              opacity:
                Math.min(frames.length - 1, Math.floor(p * frames.length)) ===
                index
                  ? 1
                  : 0,
            }}
          >
            <Image
              src={readSource(frame)}
              mode="aspectFill"
              className={cn("h-full w-full", imageClassName)}
            />
          </View>
        ))
      ) : (
        <Image
          src={readSource(frames[0])}
          mode="aspectFill"
          className={cn("absolute h-full w-full", imageClassName)}
          style={{
            ...(effect === "parallax" ? { height: "125%", top: "-12.5%" } : {}),
            transform:
              effect === "zoom" || effect === "parallax"
                ? transform
                : undefined,
          }}
        />
      )}
      {effect === "reveal" ? (
        <View
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[var(--panel-background)]"
          style={{ transform: `translateY(${-p * 100}%)` }}
        />
      ) : null}
    </View>
  );
};
