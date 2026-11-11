import { useEffect, useMemo, useRef, useState } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { impactKnock, selectionTick } from "../../lib/haptics";
import { startSourceSpring, stepSourceSpring } from "../../lib/source-spring";
import { createObservableValue } from "../../primitives/observable-value";
import { LAND } from "./constants";
import { slotOffset, targetIndex } from "./geometry";
import { moveWithPinned, stepWithPinned } from "./reorder";
import type { SortableFrame, SortableProps } from "./types";

export const useSortableModel = (props: SortableProps) => {
  const {
    value,
    gap = 0,
    activation = "handle",
    longPressDelay = 220,
    haptics = true,
    disabled = false,
  } = props;
  const reduced = usePanelReducedMotion();
  const { scale } = useWindowMetrics();
  const signal = useMemo(
    () =>
      createObservableValue<SortableFrame>({
        activeId: null,
        fingerY: 0,
        heights: {},
        lift: 0,
        order: [...value],
        pinned: {},
        rendered: [...value],
        translate: 0,
      }),
    []
  );
  const latest = useRef(props);
  latest.current = props;
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const sequence = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoscroll = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollAtStart = useRef(0);
  const stop = () => {
    sequence.current += 1;
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    if (autoscroll.current !== null) {
      clearTimeout(autoscroll.current);
    }
    timer.current = null;
    autoscroll.current = null;
  };
  const publish = (next: Partial<SortableFrame>) => {
    signal.value = { ...signal.value, ...next };
  };
  const key = value.join("\0");
  useEffect(() => {
    stop();
    publish({
      activeId: null,
      lift: 0,
      order: [...value],
      rendered: [...value],
      translate: 0,
    });
    setActiveItem(null);
  }, [key]);
  const scrollMetrics = () =>
    latest.current.scrollRef?.current?.readNativeMetrics() ?? null;
  const update = (id: string, translation: number, fingerY: number) => {
    const f = signal.value;
    if (f.activeId !== id) {
      return;
    }
    const metrics = scrollMetrics();
    const translated =
      translation +
      (metrics ? metrics.offset * scale - scrollAtStart.current : 0);
    const at = f.order.indexOf(id);
    if (at === -1) {
      return;
    }
    const top = slotOffset(f.rendered, id, f.heights, gap) + translated;
    const to = targetIndex(
      f.order,
      at,
      top,
      f.heights[id] ?? 0,
      f.heights,
      gap
    );
    const next = moveWithPinned(f.order, f.rendered, f.pinned, id, at, to);
    if (next[at] !== id && haptics) {
      void selectionTick();
    }
    publish({ fingerY, order: next, translate: translated });
  };
  const autoTranslation = useRef(0);
  const startAuto = (id: string) => {
    const request = sequence.current;
    const draw = () => {
      if (request !== sequence.current || signal.value.activeId !== id) {
        return;
      }
      const metrics = scrollMetrics();
      const handle = latest.current.scrollRef?.current;
      if (metrics && handle) {
        const threshold = latest.current.autoscrollThreshold ?? 72;
        const speed = latest.current.autoscrollSpeed ?? 8;
        const top = metrics.pageY * scale + threshold;
        const bottom = (metrics.pageY + metrics.height) * scale - threshold;
        const y = signal.value.fingerY;
        let intensity = 0;
        if (y < top) {
          intensity = (y - top) / threshold;
        } else if (y > bottom) {
          intensity = (y - bottom) / threshold;
        }
        const amount = Math.max(-1, Math.min(1, intensity));
        if (amount !== 0) {
          handle.scrollToNative(
            (metrics.offset * scale + amount * speed) / scale
          );
          update(id, autoTranslation.current, y);
        }
      }
      autoscroll.current = setTimeout(draw, 16);
    };
    if (latest.current.scrollRef) {
      autoscroll.current = setTimeout(draw, 16);
    }
  };
  const begin = (id: string, fingerY: number) => {
    stop();
    if (disabled || signal.value.pinned[id]) {
      return false;
    }
    publish({
      activeId: id,
      fingerY,
      order: [...signal.value.rendered],
      translate: 0,
    });
    autoTranslation.current = 0;
    scrollAtStart.current = (scrollMetrics()?.offset ?? 0) * scale;
    setActiveItem(id);
    startAuto(id);
    if (haptics) {
      void impactKnock();
    }
    latest.current.onDragStart?.(id);
    return true;
  };
  const settled = (id: string) => {
    const f = signal.value;
    publish({ activeId: null });
    setActiveItem(null);
    stop();
    latest.current.onDragEnd?.(id);
    const from = f.rendered.indexOf(id);
    const to = f.order.indexOf(id);
    if (from === to || from === -1 || to === -1) {
      return;
    }
    latest.current.onReorder?.([...f.order], { from, id, to });
  };
  const finalize = (id: string) => {
    const f = signal.value;
    if (f.activeId !== id) {
      return;
    }
    stop();
    const request = sequence.current;
    const landing =
      slotOffset(f.order, id, f.heights, gap) -
      slotOffset(f.rendered, id, f.heights, gap);
    if (reduced) {
      publish({ translate: landing });
      settled(id);
      return;
    }
    const spring = startSourceSpring(f.translate, landing, 0, LAND);
    let last = Date.now();
    const draw = () => {
      if (request !== sequence.current || signal.value.activeId !== id) {
        return;
      }
      const now = Date.now();
      const done = stepSourceSpring(spring, now - last);
      last = now;
      publish({ translate: spring.position });
      if (
        done ||
        (Math.abs(spring.position - landing) < 0.5 &&
          Math.abs(spring.velocity) < 2)
      ) {
        settled(id);
      } else {
        timer.current = setTimeout(draw, 16);
      }
    };
    timer.current = setTimeout(draw, 16);
  };
  const step = (id: string, delta: number) => {
    const f = signal.value;
    const from = f.rendered.indexOf(id);
    if (disabled || f.pinned[id] || from === -1) {
      return;
    }
    const next = stepWithPinned(
      f.rendered,
      f.rendered,
      f.pinned,
      id,
      from,
      delta
    );
    const to = next.indexOf(id);
    if (to === from) {
      return;
    }
    publish({ order: next });
    if (haptics) {
      void selectionTick();
    }
    latest.current.onReorder?.(next, { from, id, to });
  };
  useEffect(() => () => stop(), []);
  return {
    activation,
    activeItem,
    begin,
    disabled,
    finalize,
    gap,
    haptics,
    indexOf: (id: string) => value.indexOf(id),
    longPressDelay,
    measured: (id: string, height: number) => {
      if (signal.value.heights[id] !== height) {
        publish({ heights: { ...signal.value.heights, [id]: height } });
      }
    },
    reduced,
    scale,
    setPinned: (id: string, pinned: boolean) => {
      if (Boolean(signal.value.pinned[id]) !== pinned) {
        publish({ pinned: { ...signal.value.pinned, [id]: pinned } });
      }
    },
    signal,
    step,
    update: (id: string, translation: number, fingerY: number) => {
      autoTranslation.current = translation;
      update(id, translation, fingerY);
    },
  };
};
