import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
  nextTick,
  onWindowResize,
  offWindowResize,
} from "@tarojs/taro";
import { useEffect, useState } from "react";

import { weappNodeSelector } from "../../platform/node-selector";

export const useSceneWidth = (id: string, content: unknown) => {
  const [width, setWidth] = useState(0);
  const [scope] = useState(() => getCurrentInstance().page);
  useEffect(() => {
    let mounted = true;
    const measure = () => {
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
          .fields({ computedStyle: ["width"] }, (data) => {
            if (!mounted || !data || Array.isArray(data)) {
              return;
            }
            const raw = (data as Record<string, unknown>).width;
            if (typeof raw !== "string" || !raw.endsWith("px")) {
              return;
            }
            const measured =
              (Number(raw.slice(0, -2)) * 375) / getWindowInfo().windowWidth;
            if (Number.isFinite(measured) && measured > 0) {
              setWidth(measured);
            }
          })
          .exec();
      });
    };
    measure();
    onWindowResize(measure);
    return () => {
      mounted = false;
      offWindowResize(measure);
    };
  }, [id, content, scope]);
  return width;
};
