import { createObservableValue } from "panelui-taro/primitives/observable-value";
import { useCallback, useMemo, useRef, useState } from "react";

import type {
  NativeScrollHandle,
  LayoutChangeEvent,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "./native";

export const useScrollSections = ({ ids }: { ids: string[] }) => {
  const ref = useRef<NativeScrollHandle>(null);
  const offsets = useRef(new Map<string, number>());
  const [active, setActive] = useState(ids[0] ?? "");
  const scroll = useMemo(
    () => ({
      content: createObservableValue(0),
      offset: createObservableValue(0),
      top: createObservableValue(0),
      viewport: createObservableValue(0),
    }),
    []
  );
  const measure = useCallback(
    (id: string) => (event: LayoutChangeEvent) => {
      offsets.current.set(id, event.nativeEvent.layout.y);
    },
    []
  );
  const scrollTo = useCallback(
    (id: string) => {
      const origin = offsets.current.get(ids[0]) ?? 0;
      ref.current?.scrollTo({
        animated: true,
        y: (offsets.current.get(id) ?? origin) - origin,
      });
      setActive(id);
    },
    [ids]
  );
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const top = event.nativeEvent.contentOffset.y;
      scroll.offset.value = top;
      scroll.viewport.value = event.nativeEvent.layoutMeasurement.height;
      scroll.content.value = event.nativeEvent.contentSize.height;
      const origin = offsets.current.get(ids[0]) ?? 0;
      let current: string | undefined;
      for (const id of ids) {
        if ((offsets.current.get(id) ?? Infinity) - origin <= top + 60) {
          current = id;
        }
      }
      if (current) {
        setActive(current);
      }
    },
    [ids, scroll]
  );
  return { active, measure, ref, scroll, scrollProps: { onScroll }, scrollTo };
};
