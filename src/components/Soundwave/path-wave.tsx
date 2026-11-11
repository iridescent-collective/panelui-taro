import { Canvas, View } from "@tarojs/components";
import { useId, useSyncExternalStore } from "react";

import { GraphicSnapshot } from "../../primitives/canvas-graphics";
import type { ObservableNumber } from "../../primitives/observable-number";
import type { ObservableValue } from "../../primitives/observable-value";
import { Path, Defs } from "../../primitives/static-svg";
import type { WavePaint } from "./canvas";
import { gradientStops } from "./canvas";
import { readNumber } from "./engine";
import { barsPath, linePath } from "./geometry";
import type { SoundwaveProps, WaveFrame } from "./types";
import { useWaveCanvas } from "./use-canvas";

const NO_SUBSCRIPTION = () => () => false;
const LinearGradient = "linearGradient" as const;
const Stop = "stop" as const;
export interface PathWaveProps {
  signal: ObservableValue<WaveFrame>;
  id: string;
  width: number;
  height: number;
  stroke: number;
  count: number;
  scrolling: boolean;
  variant: "bars" | "line";
  ink: string;
  track?: string;
  fade: boolean;
  bands: number[];
  progress: SoundwaveProps["progress"];
  centered: boolean;
  gradient: SoundwaveProps["gradient"];
}
export const PathWave = (props: PathWaveProps) => {
  const {
    signal,
    id,
    width,
    height,
    stroke,
    ink,
    track,
    fade,
    gradient: palette,
    variant,
    count,
    bands,
    scrolling,
    centered,
    progress,
  } = props;
  const gradient = palette?.length ? palette : undefined;
  const external: ObservableNumber | undefined =
    typeof progress === "object" ? progress : undefined;
  const drawing = (): WavePaint => {
    const frame = signal.value;
    const geometry = {
      bands,
      barWidth: stroke,
      centered,
      count,
      frame,
      height,
      progress: progress === undefined ? undefined : readNumber(progress),
      scrolling,
      width,
    };
    return {
      edge: variant === "line" ? 0.18 : 0.12,
      fade,
      gradient: palette,
      hasProgress: progress !== undefined,
      height,
      ink,
      paths:
        variant === "bars"
          ? [barsPath(geometry, false), barsPath(geometry, true)]
          : [linePath(frame, width, height, stroke)],
      stroke,
      track,
      width,
    };
  };
  const fallback = useWaveCanvas(id, width, height, signal, external, drawing);
  useSyncExternalStore(
    fallback ? signal.subscribe : NO_SUBSCRIPTION,
    signal.getSnapshot,
    signal.getSnapshot
  );
  const progressSnapshot = () => external?.value ?? 0;
  useSyncExternalStore(
    fallback && external ? external.subscribe : NO_SUBSCRIPTION,
    progressSnapshot,
    progressSnapshot
  );
  const gradientId = `panelui-wave-${useId().replaceAll(":", "")}`;
  const paint = drawing();
  const needsDefs = fade || (gradient?.length ?? 0) > 1;
  const strokeInk = needsDefs ? `url(#${gradientId})` : ink;
  return (
    <View
      style={{
        height: `${height * 2}rpx`,
        pointerEvents: "none",
        position: "relative",
        width: `${width * 2}rpx`,
      }}
    >
      <Canvas
        aria-hidden
        id={id}
        type="2d"
        style={{ height: "100%", opacity: fallback ? 0 : 1, width: "100%" }}
      />
      {fallback ? (
        <View aria-hidden className="absolute inset-0">
          <GraphicSnapshot
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
          >
            {needsDefs ? (
              <Defs>
                <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                  {gradientStops(gradient ?? [ink], fade, paint.edge).map(
                    (stop, index) => (
                      <Stop
                        key={index}
                        offset={stop.offset}
                        stopColor={stop.color}
                        stopOpacity={stop.opacity}
                      />
                    )
                  )}
                </LinearGradient>
              </Defs>
            ) : null}
            {paint.paths.map((path, index) => {
              const rest = paint.paths.length > 1 && index === 0;
              return (
                <Path
                  key={index}
                  d={path}
                  stroke={rest && track ? track : strokeInk}
                  strokeOpacity={
                    rest && !track && progress !== undefined ? 0.3 : 1
                  }
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              );
            })}
          </GraphicSnapshot>
        </View>
      ) : null}
    </View>
  );
};
