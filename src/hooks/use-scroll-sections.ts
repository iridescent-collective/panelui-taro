import type { ScrollView } from "@tarojs/components";
import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
} from "@tarojs/taro";
import type { ComponentRef } from "react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

import { createObservableNumber } from "../primitives/observable-number";
import type { ObservableNumber } from "../primitives/observable-number";
import { useElementLayout } from "./use-element-layout";

export interface UseScrollSectionsOptions {
  ids: string[];
  offset?: number;
  endThreshold?: number;
  scrollPadding?: number;
}
export interface ScrollSectionsPosition {
  offset: ObservableNumber;
  viewport: ObservableNumber;
  content: ObservableNumber;
}
interface LayoutEvent { nativeEvent: { layout: { y?: number; height?: number } } }
interface ScrollEvent { detail: { scrollTop: number; scrollHeight: number } }
export const useScrollSections = ({
  ids,
  offset = 120,
  endThreshold = 24,
  scrollPadding = 0,
}: UseScrollSectionsOptions) => {
  const ref = useRef<ComponentRef<typeof ScrollView> | null>(null);
  const jumpTimer = useRef<ReturnType<typeof setTimeout> | undefined>();
  const offsets = useRef<Record<string, number>>({});
  const latestIds = useRef(ids);
  latestIds.current = ids;
  const [active, setActive] = useState<string | undefined>(ids[0]);
  const [scrollTop, setScrollTop] = useState<number | undefined>();
  const id = `panelui-sections-${useId().replaceAll(":", "")}`;
  const measurement = useElementLayout(true, ids.join("|"), id);
  const [scope] = useState(() => getCurrentInstance().page);
  const jumping = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>();
  const scroll = useMemo<ScrollSectionsPosition>(
    () => ({
      content: createObservableNumber(),
      offset: createObservableNumber(),
      viewport: createObservableNumber(),
    }),
    []
  );
  const onMomentumScrollEnd = useCallback(() => {
    clearTimeout(timer.current);
    jumping.current = null;
  }, []);
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(jumpTimer.current);
    },
    []
  );
  useEffect(() => {
    if (measurement.layout) {scroll.viewport.value = measurement.layout.height;}
    let alive = true;
    const query = createSelectorQuery();
    if (scope) {query.in(scope);}
    for (const section of ids) {
      if (!/^[\w-]+$/u.test(section)) {continue;}
      query.select(`#${section}`).boundingClientRect((rect) => {
        if (!alive || !rect || Array.isArray(rect) || !measurement.layout)
          {return;}
        offsets.current[section] =
          rect.top * (375 / getWindowInfo().windowWidth) -
          measurement.layout.top +
          scroll.offset.value;
        scroll.content.value = Math.max(
          scroll.content.value,
          offsets.current[section] +
            rect.height * (375 / getWindowInfo().windowWidth)
        );
      });
    }
    query.exec();
    return () => {
      alive = false;
    };
  }, [ids.join("|"), measurement.layout, scope, scroll]);
  const measure = useCallback(
    (section: string) => (event: LayoutEvent) => {
      offsets.current[section] = event.nativeEvent.layout.y ?? 0;
    },
    []
  );
  const onScroll = useCallback(
    (event: ScrollEvent) => {
      const scale = 375 / getWindowInfo().windowWidth;
      scroll.offset.value = event.detail.scrollTop * scale;
      scroll.content.value = event.detail.scrollHeight * scale;
      if (jumping.current) {return;}
      const list = latestIds.current;
      if (!list.length) {
        setActive(undefined);
        return;
      }
      if (
        scroll.content.value > 0 &&
        scroll.viewport.value > 0 &&
        scroll.offset.value + scroll.viewport.value >=
          scroll.content.value - endThreshold
      ) {
        setActive(list.at(-1));
        return;
      }
      let current = list[0];
      for (const section of list) {
        if (
          offsets.current[section] !== undefined &&
          offsets.current[section] <= scroll.offset.value + offset
        )
          {current = section;}
      }
      setActive(current);
    },
    [endThreshold, offset, scroll]
  );
  const scrollTo = useCallback(
    (section: string) => {
      const top = offsets.current[section];
      if (top === undefined || !latestIds.current.includes(section)) {return;}
      jumping.current = section;
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        jumping.current = null;
      }, 900);
      setActive(section);
      const y = Math.max(top - scrollPadding, 0);
      clearTimeout(jumpTimer.current);
      setScrollTop(undefined);
      jumpTimer.current = setTimeout(
        () => setScrollTop((y * getWindowInfo().windowWidth) / 375),
        0
      );
      const adapter = ref.current as unknown as {
        scrollTo?: (options: { y: number; animated: boolean }) => void;
      } | null;
      adapter?.scrollTo?.({ animated: true, y });
    },
    [scrollPadding]
  );
  const onLayout = useCallback(
    (event: LayoutEvent) => {
      scroll.viewport.value = event.nativeEvent.layout.height ?? 0;
    },
    [scroll]
  );
  const onContentSizeChange = useCallback(
    (_width: number, height: number) => {
      scroll.content.value = height;
    },
    [scroll]
  );
  const scrollProps = useMemo(
    () => ({
      enhanced: true,
      id,
      onContentSizeChange,
      onLayout,
      onMomentumScrollEnd,
      onScroll,
      onScrollEnd: onMomentumScrollEnd,
      scrollEventThrottle: 16,
      scrollTop,
      scrollWithAnimation: true,
    }),
    [
      id,
      onScroll,
      onMomentumScrollEnd,
      onLayout,
      onContentSizeChange,
      scrollTop,
    ]
  );
  return { active, measure, ref, scroll, scrollProps, scrollTo };
};
export type UseScrollSectionsResult = ReturnType<typeof useScrollSections>;
