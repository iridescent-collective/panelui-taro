import { createSelectorQuery, getCurrentInstance } from "@tarojs/taro";
import type { ScrollViewContext } from "@tarojs/taro";
import { useCallback, useState } from "react";

import { weappNodeSelector } from "../../platform/node-selector";

const isScrollViewContext = (node: unknown): node is ScrollViewContext =>
  typeof node === "object" &&
  node !== null &&
  "scrollTo" in node &&
  typeof node.scrollTo === "function";

export const useNativeScroll = (id: string) => {
  const [scope] = useState(() => getCurrentInstance().page);
  return useCallback(
    (
      top: number,
      animated: boolean,
      active: () => boolean,
      fallback: () => void,
      native: () => void
    ) => {
      if (!active()) {
        return;
      }
      const query = createSelectorQuery();
      if (scope) {
        query.in(scope);
      }
      const selected = query.select(weappNodeSelector(id));
      if (typeof selected.node !== "function") {
        fallback();
        return;
      }
      selected
        .node((result) => {
          if (!active()) {
            return;
          }
          if (!isScrollViewContext(result?.node)) {
            fallback();
            return;
          }
          native();
          result.node.scrollTo({
            animated,
            ...(animated ? {} : { duration: 0 }),
            top,
          });
        })
        .exec();
    },
    [id, scope]
  );
};
