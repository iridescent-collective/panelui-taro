import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
  nextTick,
  offWindowResize,
  onWindowResize,
} from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

import { weappNodeSelector } from "../../platform/node-selector";

export const useContentPadding = (className: string | undefined) => {
  const [scope] = useState(() => getCurrentInstance().page);
  const [padding, setPadding] = useState({ bottom: 64, top: 16 });
  const contentId = useRef<string | null>(null);
  const generation = useRef(0);
  const measure = useCallback(() => {
    generation.current += 1;
    const version = generation.current;
    const id = contentId.current;
    if (!id) {
      return;
    }
    nextTick(() => {
      if (version !== generation.current) {
        return;
      }
      const query = createSelectorQuery();
      if (scope) {
        query.in(scope);
      }
      query
        .select(weappNodeSelector(id))
        .fields(
          { computedStyle: ["paddingTop", "paddingBottom"] },
          (result) => {
            if (
              version !== generation.current ||
              !result ||
              Array.isArray(result)
            ) {
              return;
            }
            const scale = 375 / getWindowInfo().windowWidth;
            const top =
              typeof result.paddingTop === "string"
                ? Number(result.paddingTop.replace(/px$/u, "")) * scale
                : Number.NaN;
            const bottom =
              typeof result.paddingBottom === "string"
                ? Number(result.paddingBottom.replace(/px$/u, "")) * scale
                : Number.NaN;
            if (!Number.isFinite(top) || !Number.isFinite(bottom)) {
              return;
            }
            setPadding((before) =>
              before.top === top && before.bottom === bottom
                ? before
                : { bottom, top }
            );
          }
        )
        .exec();
    });
  }, [scope]);
  useEffect(() => {
    measure();
    onWindowResize(measure);
    return () => {
      generation.current += 1;
      offWindowResize(measure);
    };
  }, [className, measure]);
  const bindContent = useCallback(
    (id: string | null) => {
      contentId.current = id;
      measure();
    },
    [measure]
  );
  return { bindContent, padding };
};
