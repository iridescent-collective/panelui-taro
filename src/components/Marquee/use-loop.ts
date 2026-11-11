import { useContext, useEffect, useId, useMemo, useState } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { MarqueeGroupContext } from "./context";
import { marqueeCopyCount, normalizeMarqueeSpeed } from "./marquee-math";
import type { MarqueeProps } from "./types";
import { useMarqueeOffset } from "./use-offset";

export const useMarqueeLoop = (
  props: MarqueeProps,
  horizontal: boolean,
  speedProp: number,
  spacing: number,
  playing: boolean,
  reverse: boolean
) => {
  const {
    children,
    className,
    style,
    onLayout,
    showPauseControl,
    onPlayingChange,
  } = props;
  const reduced = usePanelReducedMotion();
  const sign = useDirectionSign();
  const [userPaused, setUserPaused] = useState(false);
  const group = useContext(MarqueeGroupContext);
  const inputs = useMemo(
    () => ({ children, className, horizontal, style }),
    [children, horizontal, className, style]
  );
  const viewport = useElementLayout(
    true,
    inputs,
    reduced ? props.id : undefined,
    false
  );
  const content = useElementLayout(!reduced, inputs);
  const axis = horizontal ? "width" : "height";
  const viewportLength = viewport.layout?.[axis] ?? 0;
  const contentLength = content.layout?.[axis] ?? 0;
  const layout = marqueeCopyCount(viewportLength, contentLength, spacing);
  const speed = normalizeMarqueeSpeed(speedProp);
  const moving = playing && !userPaused && !group?.paused && !reduced;
  const offset = useMarqueeOffset(layout.period, speed, moving);
  const live = playing && !reduced && layout.count > 0 && speed > 0;
  const id = useId();
  const report = group?.report;
  useEffect(() => {
    if (!report) {
      return;
    }
    report(id, live);
    return () => report(id, false);
  }, [report, id, live]);
  useEffect(() => {
    if (viewport.layout) {
      onLayout?.(viewport.layout);
    }
  }, [onLayout, viewport.layout]);
  return {
    content,
    contentLength,
    layout,
    reduced,
    showControl: (showPauseControl ?? group === null) && live,
    toggle: () => {
      const next = !userPaused;
      setUserPaused(next);
      onPlayingChange?.(!next);
    },
    travel: (reverse ? offset : -offset) * (horizontal ? sign : 1),
    userPaused,
    viewport,
  };
};
