import { createSelectorQuery, getCurrentInstance } from "@tarojs/taro";
import { useCallback, useState } from "react";

import { weappNodeSelector } from "../../platform/node-selector";

interface NativeScrollOffset {
  top: number;
  height?: number;
}
export const useNativeScrollOffset = (id: string) => {
  const [scope] = useState(() => getCurrentInstance().page);
  return useCallback(
    (accept: (offset: NativeScrollOffset | null) => void) => {
      const query = createSelectorQuery();
      if (scope) {
        query.in(scope);
      }
      const selected = query.select(weappNodeSelector(id));
      if (typeof selected.scrollOffset !== "function") {
        accept(null);
        return;
      }
      selected
        .scrollOffset((result) => {
          if (!result || !Number.isFinite(result.scrollTop)) {
            accept(null);
            return;
          }
          const height: unknown = Reflect.get(result, "scrollHeight");
          accept({
            height:
              typeof height === "number" && Number.isFinite(height)
                ? height
                : undefined,
            top: result.scrollTop,
          });
        })
        .exec();
    },
    [id, scope]
  );
};
