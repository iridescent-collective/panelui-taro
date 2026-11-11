import { useCallback, useMemo, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import {
  clamp,
  DEFAULT_MIN_HEIGHT,
  resolveLength,
  resolveSnapPoints,
} from "./split-view-math";
import type { SplitViewProps } from "./types";

export const useSplitGeometry = (props: SplitViewProps) => {
  const inputs = useMemo(
    () => ({ className: props.className, style: props.style }),
    [props.className, props.style]
  );
  const measured = useElementLayout(true, inputs, props.id, false);
  const [dragAreaHeight, setDragAreaHeight] = useState(0);
  const room = Math.max((measured.layout?.height ?? 0) - dragAreaHeight, 0);
  const minPx = clamp(
    resolveLength(props.minHeight, room, DEFAULT_MIN_HEIGHT),
    0,
    room
  );
  const maxPx = clamp(resolveLength(props.maxHeight, room, room), minPx, room);
  const key = JSON.stringify([props.snapPoints ?? null, room, minPx, maxPx]);
  const points = useMemo(() => {
    const [declared, available, min, max]: [
      readonly number[] | null,
      number,
      number,
      number,
    ] = JSON.parse(key);
    return available > 0
      ? resolveSnapPoints(declared ?? undefined, available, min, max)
      : [];
  }, [key]);
  const measureDragArea = useCallback(
    (height: number) =>
      setDragAreaHeight((current) =>
        Math.abs(current - height) < 0.5 ? current : height
      ),
    []
  );
  return {
    dragAreaHeight,
    maxPx,
    measureDragArea,
    measured,
    minPx,
    points,
    room,
  };
};
