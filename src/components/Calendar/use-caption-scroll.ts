import {
  createSelectorQuery,
  getCurrentInstance,
  nextTick,
} from "@tarojs/taro";
import type { ScrollViewContext } from "@tarojs/taro";
import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";

import { weappNodeSelector } from "../../platform/node-selector";

// Match Native's onContentSizeChange -> scrollTo. The popup's layout callback
// and mounted content supply readiness, without binding offsets or polling.
export const useCaptionScroll = (offset: number, open: boolean) => {
  const id = `panelui-calendar-${useId().replaceAll(":", "")}`;
  const [scope] = useState(() => getCurrentInstance().page);
  const latest = useRef({ offset, open });
  latest.current = { offset, open };
  const session = useRef({ revision: 0, requested: false, interrupted: false });
  useLayoutEffect(() => {
    session.current.revision += 1;
    session.current.requested = false;
    session.current.interrupted = false;
    return () => {
      session.current.revision += 1;
    };
  }, [open]);
  const interrupt = useCallback(() => {
    session.current.interrupted = true;
    session.current.revision += 1;
  }, []);
  const initialize = useCallback(() => {
    if (
      !latest.current.open ||
      session.current.requested ||
      session.current.interrupted
    )
      return;
    session.current.requested = true;
    const request = session.current.revision;
    const active = () =>
      latest.current.open && request === session.current.revision;
    nextTick(() => {
      if (!active()) return;
      const query = createSelectorQuery();
      if (scope) query.in(scope);
      query
        .select(weappNodeSelector(id))
        .node((result) => {
          if (!active()) return;
          const context = result?.node as ScrollViewContext | undefined;
          context?.scrollTo?.({
            top: Math.max(0, latest.current.offset),
            animated: false,
          });
        })
        .exec();
    });
    // A retained popup may reopen before exit unmounts it. Changing this callback
    // lets its existing layout notify the new open session, once only.
  }, [id, scope, open, offset]);
  return { id, initialize, interrupt };
};
