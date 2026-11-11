import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
  nextTick,
} from "@tarojs/taro";
import type { ScrollViewContext } from "@tarojs/taro";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { weappNodeSelector } from "../platform/node-selector";

// Native commands leave scrolling uncontrolled. Older hosts need a live offset:
// clearing their scroll-top/scroll-left attribute resets the native view to zero.
export const useScrollCommand = (horizontal = false) => {
  const id = `panelui-scroll-${useId().replaceAll(":", "")}`;
  const [scope] = useState(() => getCurrentInstance().page);
  const [position, setPosition] = useState<number>();
  const generation = useRef(0);
  const fallbackMode = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const cancel = useCallback(() => {
    generation.current += 1;
    if (timer.current !== undefined) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
    if (!fallbackMode.current) setPosition(undefined);
  }, []);
  useEffect(
    () => () => {
      generation.current += 1;
      if (timer.current !== undefined) clearTimeout(timer.current);
    },
    []
  );
  const scrollTo = useCallback(
    (offset: number, valid: () => boolean = () => true) => {
      cancel();
      const request = generation.current;
      const active = () => request === generation.current && valid();
      const target = Math.max(0, offset);
      const fallback = () => {
        if (!active()) return;
        fallbackMode.current = true;
        setPosition(target);
      };
      // Some hosts accept scrollTo before their native scroll surface is ready.
      // Confirm the result, otherwise use the synchronized compatibility path.
      const verify = (remaining: number) =>
        nextTick(() => {
          if (!active()) return;
          const query = createSelectorQuery();
          if (scope) query.in(scope);
          query
            .select(weappNodeSelector(id))
            .fields({ scrollOffset: true }, (metrics) => {
              if (!active()) return;
              const actual = horizontal
                ? metrics?.scrollLeft
                : metrics?.scrollTop;
              if (typeof actual !== "number" || Math.abs(actual - target) <= 1)
                return;
              if (remaining > 0)
                timer.current = setTimeout(() => verify(remaining - 1), 32);
              else fallback();
            })
            .exec();
        });
      const attempt = (remaining: number) =>
        nextTick(() => {
          if (!active()) return;
          const query = createSelectorQuery();
          if (scope) query.in(scope);
          const node = query.select(weappNodeSelector(id));
          node
            .boundingClientRect((rect) => {
              if (!active()) return;
              const window = getWindowInfo();
              // Popovers measure offscreen before placement. Size alone is not readiness.
              if (
                !rect ||
                Array.isArray(rect) ||
                rect.width <= 0 ||
                rect.height <= 0 ||
                rect.left + rect.width <= 0 ||
                rect.top + rect.height <= 0 ||
                rect.left >= window.windowWidth ||
                rect.top >= window.windowHeight
              ) {
                if (remaining > 0)
                  timer.current = setTimeout(() => attempt(remaining - 1), 32);
                return;
              }
              const nativeQuery = createSelectorQuery();
              if (scope) nativeQuery.in(scope);
              const selected = nativeQuery.select(weappNodeSelector(id));
              if (typeof selected.node !== "function") {
                fallback();
                return;
              }
              selected
                .node((result) => {
                  if (!active()) return;
                  const context = result?.node as ScrollViewContext | undefined;
                  if (
                    fallbackMode.current ||
                    typeof context?.scrollTo !== "function"
                  ) {
                    fallback();
                    return;
                  }
                  context.scrollTo({
                    animated: false,
                    duration: 0,
                    ...(horizontal ? { left: target } : { top: target }),
                  });
                  verify(4);
                })
                .exec();
            })
            .exec();
        });
      attempt(8);
    },
    [cancel, horizontal, id, scope]
  );
  const acknowledge = useCallback((offset: number) => {
    if (fallbackMode.current) setPosition(offset);
  }, []);
  return { acknowledge, cancel, id, position, scrollTo };
};
