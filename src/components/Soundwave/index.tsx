import { View } from "@tarojs/components";

import { mergeStyle, mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { STATE_LABEL } from "./constants";
import { PathWave } from "./path-wave";
import type { SoundwaveProps } from "./types";
import { useWaveModel } from "./use-model";
import { AmbientWave, PillsWave } from "./views";

export type { SoundwaveProps, SoundwaveState, SoundwaveVariant } from "./types";
const WaveContents = ({
  model,
  props,
}: {
  model: ReturnType<typeof useWaveModel>;
  props: SoundwaveProps;
}) => {
  if (model.variant === "pills") {
    return (
      <PillsWave
        signal={model.signal}
        ink={model.ink}
        count={model.count}
        width={model.stroke}
        height={model.box}
        gap={model.gap}
      />
    );
  }
  if (model.variant === "ambient") {
    return (
      <AmbientWave
        signal={model.signal}
        ink={model.ink}
        palette={props.gradient}
        radius={model.radius}
      />
    );
  }
  if (model.width <= 0 || model.box <= 0) {
    return null;
  }
  return (
    <PathWave
      id={model.canvasId}
      signal={model.signal}
      variant={model.variant}
      width={model.width}
      height={model.box}
      stroke={model.stroke}
      count={model.count}
      scrolling={model.scrolling}
      ink={model.ink}
      track={model.track}
      fade={model.fade}
      gradient={props.gradient}
      bands={props.levels ?? []}
      progress={props.progress}
      centered={props.centered ?? true}
    />
  );
};
export const Soundwave = (source: SoundwaveProps) => {
  const {
    className,
    variant: _variant,
    state: _state,
    level: _level,
    levels: _levels,
    progress: _progress,
    bars: _bars,
    barWidth: _barWidth,
    barGap: _barGap,
    height: _height,
    mode: _mode,
    centered: _centered,
    fadeEdges: _fadeEdges,
    sensitivity: _sensitivity,
    speed: _speed,
    color: _color,
    gradient: _gradient,
    trackColor: _trackColor,
    paused: _paused,
    radius: _radius,
    accessibilityLabel,
    style,
    id: _id,
    ...native
  } = source;
  const model = useWaveModel(source);
  const ambient = model.variant === "ambient";
  return (
    <View
      {...native}
      id={model.id}
      role="img"
      aria-role="image"
      aria-label={accessibilityLabel ?? STATE_LABEL[model.state]}
      className={cn(
        ambient ? "absolute inset-0" : "flex w-full justify-center",
        className
      )}
      style={
        ambient
          ? mergeStyleAfter(style, { pointerEvents: "none" })
          : mergeStyle({ height: `${model.box * 2}rpx` }, style)
      }
    >
      <WaveContents model={model} props={source} />
    </View>
  );
};
Soundwave.displayName = "Soundwave";
