import { useId, useMemo } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useIconColor } from "../../icons/context";
import { getRegisteredThemeTokens } from "../../theme/registry";
import { useTheme } from "../../theme/use-theme";
import { DEFAULTS } from "./constants";
import type { SoundwaveProps } from "./types";
import { useWaveEngine } from "./use-engine";

const dimension = (value: number) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;
const resolveColor = (
  value: string | undefined,
  tokens: Readonly<Record<string, string>>
) =>
  value?.startsWith("--")
    ? tokens[value.replace(/^--(?:color-|panel-)?/u, "")]
    : value;
const waveGeometry = (props: SoundwaveProps) => {
  const variant = props.variant ?? "pills";
  const defaults = DEFAULTS[variant];
  return {
    box: dimension(props.height ?? defaults.height),
    count: Math.floor(dimension(props.bars ?? defaults.bars)),
    gap: dimension(props.barGap ?? defaults.barGap),
    radius: dimension(props.radius ?? 44),
    stroke: dimension(props.barWidth ?? defaults.barWidth),
    variant,
  };
};
const wavePlayback = (props: SoundwaveProps) => {
  const variant = props.variant ?? "pills";
  const scrolling = variant === "bars" && props.mode === "scrolling";
  const still =
    variant === "bars" && !scrolling && (props.levels?.length ?? 0) > 0;
  return {
    fade: props.fadeEdges ?? (variant === "line" || scrolling),
    paused: (props.paused ?? false) || still,
    scrolling,
  };
};
const useWavePalette = (props: SoundwaveProps) => {
  const { theme } = useTheme();
  const tokens = getRegisteredThemeTokens(theme);
  const inherited = useIconColor();
  return {
    ink:
      resolveColor(props.color, tokens) ??
      (props.variant === "ambient"
        ? tokens.info
        : (inherited ?? tokens.foreground)),
    track: resolveColor(props.trackColor, tokens),
  };
};
export const useWaveModel = (props: SoundwaveProps) => {
  const geometry = waveGeometry(props);
  const playback = wavePlayback(props);
  const palette = useWavePalette(props);
  const state = props.state ?? "listening";
  const sensitivity = props.sensitivity ?? 1;
  const speed = props.speed ?? 1;
  const signal = useWaveEngine({
    history: playback.scrolling ? geometry.count : 0,
    level: props.level,
    paused: playback.paused,
    sensitivity: Number.isFinite(sensitivity) ? sensitivity : 1,
    speed: Number.isFinite(speed) ? speed : 0,
    state,
  });
  const measuredContent = useMemo(
    () => ({
      className: props.className,
      style: props.style,
      variant: geometry.variant,
    }),
    [props.className, props.style, geometry.variant]
  );
  const measured = useElementLayout(
    geometry.variant === "bars" || geometry.variant === "line",
    measuredContent,
    props.id
  );
  const generated = `panelui-soundwave-${useId().replaceAll(":", "")}`;
  return {
    ...geometry,
    ...playback,
    ...palette,
    canvasId: `${props.id ?? generated}-canvas`,
    id: measured.id,
    signal,
    state,
    width: Math.round(measured.layout?.width ?? 0),
  };
};
