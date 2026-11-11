import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
  nextTick,
} from "@tarojs/taro";
import { useCallback, useEffect, useRef, useState } from "react";

import { weappNodeSelector } from "../../platform/node-selector";
import type { TabLayout } from "./types";

interface Bounds {
  left: number;
  width: number;
}
const boundsOf = (value: unknown): Bounds | undefined => {
  if (
    !value ||
    typeof value !== "object" ||
    !("left" in value) ||
    !("width" in value)
  ) {
    return;
  }
  if (
    typeof value.left === "number" &&
    Number.isFinite(value.left) &&
    typeof value.width === "number" &&
    Number.isFinite(value.width)
  ) {
    return { left: value.left, width: value.width };
  }
};
export const useRowLayouts = (
  id: string,
  registerLayout: (value: string, layout: TabLayout) => void
) => {
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [scope] = useState(() => getCurrentInstance().page);
  const mounted = useRef(true);
  const latestEntries = useRef(entries);
  latestEntries.current = entries;
  const request = useRef(0);
  const registerTrigger = useCallback((value: string, nodeId: string) => {
    setEntries((current) =>
      current[value] === nodeId ? current : { ...current, [value]: nodeId }
    );
    return () => {
      if (!mounted.current) {
        return;
      }
      setEntries((current) => {
        if (current[value] !== nodeId) {
          return current;
        }
        const { [value]: _removed, ...next } = current;
        return next;
      });
    };
  }, []);
  const refresh = useCallback(() => {
    request.current += 1;
    const owner = request.current;
    nextTick(() => {
      if (!mounted.current || request.current !== owner) {
        return;
      }
      const query = createSelectorQuery();
      if (scope) {
        query.in(scope);
      }
      let row: Bounds | undefined;
      const layouts: Record<string, Bounds> = {};
      query.select(weappNodeSelector(id)).boundingClientRect((rect) => {
        row = boundsOf(rect);
      });
      for (const [value, nodeId] of Object.entries(entries)) {
        query.select(weappNodeSelector(nodeId)).boundingClientRect((rect) => {
          const bounds = boundsOf(rect);
          if (bounds) {
            layouts[value] = bounds;
          }
        });
      }
      query.exec(() => {
        if (!mounted.current || !row || request.current !== owner) {
          return;
        }
        const scale = 375 / getWindowInfo().windowWidth;
        for (const [value, bounds] of Object.entries(layouts)) {
          if (latestEntries.current[value] !== entries[value]) {
            continue;
          }
          registerLayout(value, {
            width: bounds.width * scale,
            x: (bounds.left - row.left) * scale,
          });
        }
      });
    });
  }, [entries, id, registerLayout, scope]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return { refresh, registerTrigger };
};
