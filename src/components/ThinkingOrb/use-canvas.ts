import { onAppHide, offAppHide, onAppShow, offAppShow } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import { useCanvasSurface } from "../../primitives/use-canvas-surface";
import { paintOrbPaths } from "./canvas";
import { PROFILES, STILL_FRAME } from "./constants";
import { renderFrame } from "./geometry";
import type { ThinkingOrbState } from "./types";

export interface OrbDrawing {
  state: ThinkingOrbState;
  size: number;
  speed: number;
  paused: boolean;
  reduced: boolean;
  ink: string;
}
export const normalizeOrbSpeed = (value: number) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;
export const normalizeOrbSize = (value: number) =>
  Number.isFinite(value) ? Math.max(0, value) : 0;
const frameTime = (clock: number, drawing: OrbDrawing) =>
  (drawing.paused || drawing.reduced) && clock <= 0 ? STILL_FRAME : clock;
export const useOrbCanvas = (id: string, drawing: OrbDrawing, _anchor = id) => {
  const clock = useRef(0);
  const last = useRef<number>();
  const latest = useRef(drawing);
  latest.current = drawing;
  const surface = useCanvasSurface(
    id,
    drawing.size,
    drawing.size,
    (ctx, _node, now) => {
      const config = latest.current;
      if (config.size <= 0) return;
      const profile = PROFILES[config.state][config.size <= 32 ? "sm" : "md"];
      const running = !config.paused && !config.reduced && config.speed > 0;
      if (running && last.current !== undefined)
        clock.current +=
          ((now < last.current
            ? 16
            : Math.min(48, Math.max(0, now - last.current))) /
            1000) *
          profile.speed *
          config.speed;
      last.current = now;
      paintOrbPaths(
        ctx,
        renderFrame(
          config.state,
          config.size,
          frameTime(clock.current, config),
          profile
        ),
        config.size,
        config.ink
      );
      return running;
    }
  );
  useEffect(() => {
    last.current = undefined;
    const reset = () => {
      last.current = undefined;
    };
    onAppHide(reset);
    onAppShow(reset);
    return () => {
      offAppHide(reset);
      offAppShow(reset);
    };
  }, [drawing.paused, drawing.reduced]);
  return {
    fallback: surface.unavailable || surface.occluded,
    scrolling: false,
    time: frameTime(clock.current, drawing),
  };
};
