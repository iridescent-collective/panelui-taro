import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
  nextTick,
  onWindowResize,
  offWindowResize,
} from "@tarojs/taro";
import { useEffect, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { weappNodeSelector } from "../../platform/node-selector";

export const useNodeSize = (content: unknown, id: string) => {
  const measured = useElementLayout(true, content, id, false);
  const [scope] = useState(() => getCurrentInstance().page);
  const [size, setSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  useEffect(() => {
    let mounted = true;
    const refresh = () =>
      nextTick(() => {
        if (!mounted) {
          return;
        }
        const query = createSelectorQuery();
        if (scope) {
          query.in(scope);
        }
        query
          .select(weappNodeSelector(id))
          .fields({ computedStyle: ["width", "height"] }, (data) => {
            if (!mounted || !data || Array.isArray(data)) {
              return;
            }
            const raw = data as Record<string, unknown>;
            if (
              typeof raw.width !== "string" ||
              typeof raw.height !== "string" ||
              !raw.width.endsWith("px") ||
              !raw.height.endsWith("px")
            ) {
              return;
            }
            const scale = 375 / getWindowInfo().windowWidth;
            const width = Number(raw.width.slice(0, -2)) * scale;
            const height = Number(raw.height.slice(0, -2)) * scale;
            if (
              Number.isFinite(width) &&
              Number.isFinite(height) &&
              width > 0 &&
              height > 0
            ) {
              setSize((previous) =>
                previous?.width === width && previous.height === height
                  ? previous
                  : { height, width }
              );
            }
          })
          .exec();
      });
    refresh();
    onWindowResize(refresh);
    return () => {
      mounted = false;
      offWindowResize(refresh);
    };
  }, [content, id, scope]);
  return size ?? measured.layout;
};
