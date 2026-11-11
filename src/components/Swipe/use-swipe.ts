import { showActionSheet } from "@tarojs/taro";
import {
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import type { Ref } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpringController } from "../../hooks/use-source-spring";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { SWIPE_SPRING } from "./constants";
import { SwipeGroupContext } from "./context";
import { collectSwipeActions, swipeChildren } from "./declarations";
import { swipeRelease } from "./math";
import type { SwipeHandle, SwipeOpenSide, SwipeProps } from "./types";
import { useSwipePan } from "./use-pan";

export const useSwipeModel = (
  {
    children,
    disabled = false,
    fullSwipe = true,
    haptics = false,
    onOpenChange,
  }: SwipeProps,
  ref: Ref<SwipeHandle>
) => {
  const sign = useDirectionSign();
  const { scale } = useWindowMetrics();
  const reduced = usePanelReducedMotion();
  const spring = useSourceSpringController(0, SWIPE_SPRING, reduced);
  const parts = useMemo(() => swipeChildren(children), [children]);
  const startActions = useMemo(
    () => collectSwipeActions(parts.startNode),
    [parts.startNode]
  );
  const endActions = useMemo(
    () => collectSwipeActions(parts.endNode),
    [parts.endNode]
  );
  const hasStart = parts.startNode !== null && parts.startNode !== undefined;
  const hasEnd = parts.endNode !== null && parts.endNode !== undefined;
  const startLayout = useElementLayout(
    hasStart,
    parts.startNode,
    undefined,
    false
  );
  const endLayout = useElementLayout(hasEnd, parts.endNode, undefined, false);
  const start = startLayout.layout?.width ?? 0;
  const end = endLayout.layout?.width ?? 0;
  const openSide = useRef<SwipeOpenSide>(null);
  const latest = useRef({ end, endActions, onOpenChange, start, startActions });
  latest.current = { end, endActions, onOpenChange, start, startActions };
  const stopContact = useRef<(() => void) | null>(null);
  const report = useCallback((side: SwipeOpenSide) => {
    if (openSide.current === side) {
      return;
    }
    openSide.current = side;
    latest.current.onOpenChange?.(side);
  }, []);
  const close = useCallback(() => {
    stopContact.current?.();
    spring.springTo(0);
    report(null);
  }, [spring.springTo, report]);
  const group = useContext(SwipeGroupContext);
  const closeRef = useRef(close);
  closeRef.current = close;
  const member = useRef({ close: () => closeRef.current() }).current;
  useEffect(() => group?.join(member), [group, member]);
  const announce = (side: SwipeOpenSide) => {
    report(side);
    if (side !== null) {
      group?.opened(member);
    }
  };
  const restore = () => {
    const side = openSide.current;
    const target =
      side === "start" ? latest.current.start : -latest.current.end;
    spring.springTo(side === null ? 0 : target);
  };
  const pan = useSwipePan({
    begin: () => {
      const current = spring.read();
      spring.setImmediate(current);
      return current;
    },
    domain: [...startActions, ...endActions]
      .map((action) => action.label)
      .join("\0"),
    enabled:
      !disabled &&
      ((parts.startNode !== null && parts.startNode !== undefined) ||
        (parts.endNode !== null && parts.endNode !== undefined)),
    end,
    finish: (offset, velocity) => {
      const result = swipeRelease(offset, velocity, start, end, fullSwipe);
      spring.springTo(result.target);
      if (result.fire) {
        const action = offset > 0 ? startActions[0] : endActions.at(-1);
        action?.onPress?.();
        report(null);
      } else {
        announce(result.side);
      }
    },
    full: fullSwipe,
    haptics,
    restore,
    scale,
    sign,
    start,
    update: spring.setImmediate,
  });
  stopContact.current = pan.stop;
  useImperativeHandle(ref, () => ({
    close,
    open: (side) => {
      const width = side === "start" ? start : end;
      if (width === 0) {
        return;
      }
      stopContact.current?.();
      spring.springTo(side === "start" ? width : -width);
      announce(side);
    },
  }));
  useEffect(() => {
    const side = openSide.current;
    if ((side === "start" && start === 0) || (side === "end" && end === 0)) {
      close();
    } else if (side !== null) {
      restore();
    }
  }, [start, end]);
  const actions = [...startActions, ...endActions];
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const mounted = useRef(true);
  const request = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current += 1;
    };
  }, []);
  const accessibilityMenu = async () => {
    if (!actions.length) {
      return;
    }
    request.current += 1;
    const version = request.current;
    const menu = actions;
    try {
      const result = await showActionSheet({
        itemList: menu.map((action) => action.label),
      });
      if (
        !mounted.current ||
        version !== request.current ||
        actionsRef.current.length !== menu.length ||
        menu.some((action, index) => {
          const current = actionsRef.current[index];
          return (
            current?.label !== action.label ||
            current.color !== action.color ||
            current.onPress !== action.onPress
          );
        })
      ) {
        return;
      }
      actionsRef.current[result.tapIndex]?.onPress?.();
    } catch {
      return false;
    }
  };
  return {
    ...parts,
    accessibilityMenu,
    close,
    endActions,
    endLayout,
    hasEnd,
    hasStart,
    pan,
    sign,
    signal: spring.signal,
    startActions,
    startLayout,
  };
};
