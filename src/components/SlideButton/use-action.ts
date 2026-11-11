import { showActionSheet } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import type { SlideButtonProps } from "./types";
import type { SlideState } from "./use-state";

export const useSlideAction = (
  props: SlideButtonProps,
  state: SlideState,
  cancel: () => void
) => {
  const latest = useRef({ cancel, props, state });
  latest.current = { cancel, props, state };
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return async () => {
    const request = latest.current;
    if (request.props.disabled || request.state.completed) {
      return;
    }
    request.cancel();
    const label = request.props.accessibilityActionLabel ?? "Confirm";
    try {
      const { tapIndex } = await showActionSheet({ itemList: [label] });
      const owner = latest.current;
      if (
        !mounted.current ||
        owner.props.disabled ||
        owner.state.completed ||
        (owner.props.accessibilityActionLabel ?? "Confirm") !== label ||
        tapIndex !== 0
      ) {
        return;
      }
      owner.state.activate();
    } catch {
      return false;
    }
  };
};
