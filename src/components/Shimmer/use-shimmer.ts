import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useThemeToken } from "../../theme/use-theme";
import { withShimmerAlpha } from "./colors";
import type { ShimmerProps } from "./types";

export type ShimmerStyle = CSSProperties & {
  "--panel-shimmer-from": string;
  "--panel-shimmer-to": string;
};
const settings = ({
  duration = 2000,
  spread = 2,
  mode = "loop",
  once = false,
  reverse = false,
  enabled = true,
  ...props
}: ShimmerProps) => ({
  duration,
  enabled,
  mode,
  once,
  reverse,
  spread,
  ...props,
});
export const useShimmer = (props: ShimmerProps) => {
  const { duration, spread, mode, once, reverse, enabled } = settings(props);
  const reduced = usePanelReducedMotion();
  const sign = useDirectionSign();
  const muted = useThemeToken("muted-foreground");
  const foreground = useThemeToken("foreground");
  const base = props.baseColor ?? muted;
  const highlight = props.shimmerColor ?? props.color ?? foreground;
  const measured = useElementLayout(
    enabled && !reduced,
    props.children,
    props.id
  );
  const width = measured.layout?.width ?? 0;
  const band = Math.max(width * spread, 1);
  const animating = enabled && !reduced && width > 0;
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (animating) {
      setPhase((current) => 1 - current);
    }
  }, [animating, duration, mode, once]);
  const backwards = reverse !== (sign === -1);
  const alphaColor =
    props.intensity === undefined
      ? highlight
      : withShimmerAlpha(highlight, props.intensity);
  const sweep: ShimmerStyle = {
    "--panel-shimmer-from": `${(backwards ? width : -band) * 2}rpx`,
    "--panel-shimmer-to": `${(backwards ? -band : width) * 2}rpx`,
    animation: `panel-shimmer-sweep-${phase} ${Math.max(1, duration)}ms linear ${once ? "1" : "infinite"} ${mode === "ping-pong" ? "alternate" : "normal"} forwards`,
    backgroundColor: base,
    backgroundImage: `linear-gradient(90deg,${base} 0%,${alphaColor} 50%,${base} 100%)`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${band * 2}rpx 100%`,
  };
  return { animating, base, id: measured.id, sweep };
};
