import { useEffect, useRef } from "react";

import type { ObservableNumber } from "../../primitives/observable-number";
import type { ObservableValue } from "../../primitives/observable-value";
import { useCanvasSurface } from "../../primitives/use-canvas-surface";
import { paintWave } from "./canvas";
import type { WavePaint } from "./canvas";
import type { WaveFrame } from "./types";

export const useWaveCanvas = (
  id: string,
  width: number,
  height: number,
  signal: ObservableValue<WaveFrame>,
  progress: ObservableNumber | undefined,
  drawing: () => WavePaint
) => {
  const latest = useRef(drawing);
  latest.current = drawing;
  const surface = useCanvasSurface(id, width, height, (ctx) =>
    paintWave(ctx, latest.current())
  );
  const request = useRef(surface.requestPaint);
  request.current = surface.requestPaint;
  useEffect(() => signal.subscribe(() => request.current()), [signal]);
  useEffect(() => progress?.subscribe(() => request.current()), [progress]);
  return surface.unavailable || surface.occluded;
};
