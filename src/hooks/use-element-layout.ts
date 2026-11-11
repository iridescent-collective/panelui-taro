import { document, MutationObserver } from "@tarojs/runtime";
import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
  nextTick,
} from "@tarojs/taro";
import { useCallback, useEffect, useId, useState } from "react";

import { weappNodeSelector } from "../platform/node-selector";
import { subscribeWindowResize } from "./window-resize-subscription";

export interface ElementLayout {
  width: number;
  height: number;
  left: number;
  top: number;
}
export const useElementLayout = (
  enabled: boolean,
  content: unknown,
  idOverride?: string,
  observeAttributes = true
) => {
  const generatedId = `panelui-measure-${useId().replaceAll(":", "")}`;
  const id = idOverride ?? generatedId;
  const [scope] = useState(() => getCurrentInstance().page);
  const [layout, setLayout] = useState<ElementLayout | null>(null);
  const measure = useCallback(
    (
      active: () => boolean,
      listener?: (layout: ElementLayout | null) => void
    ) => {
      nextTick(() => {
        if (!active()) {
          return;
        }
        const query = createSelectorQuery();
        if (scope) {
          query.in(scope);
        }
        query
          .select(weappNodeSelector(id))
          .boundingClientRect((rect) => {
            if (!active()) {
              return;
            }
            if (Array.isArray(rect) || !rect) {
              listener?.(null);
              return;
            }
            const scale = 375 / getWindowInfo().windowWidth;
            const next = {
              height: rect.height * scale,
              left: rect.left * scale,
              top: rect.top * scale,
              width: rect.width * scale,
            };
            listener?.(next);
            setLayout((current) =>
              current &&
              Object.keys(next).every(
                (key) =>
                  current[key as keyof ElementLayout] ===
                  next[key as keyof ElementLayout]
              )
                ? current
                : next
            );
          })
          .exec();
      });
    },
    [id, scope]
  );
  useEffect(() => {
    if (!enabled) {
      setLayout(null);
      return;
    }
    let mounted = true;
    const refresh = () => measure(() => mounted);
    refresh();
    let observer: MutationObserver | undefined;
    nextTick(() => {
      if (!mounted) {
        return;
      }
      const element = document.querySelector(`#${id}`);
      if (!element) {
        return;
      }
      observer = new MutationObserver(refresh);
      observer.observe(element, {
        attributes: observeAttributes,
        characterData: true,
        childList: true,
        subtree: true,
      });
    });
    const unsubscribe = subscribeWindowResize(refresh);
    return () => {
      mounted = false;
      unsubscribe();
      observer?.disconnect();
    };
  }, [content, enabled, id, measure, observeAttributes]);
  return { id, layout, refresh: measure };
};
