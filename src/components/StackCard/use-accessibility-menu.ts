import { showActionSheet } from "@tarojs/taro";
import { useEffect, useRef } from "react";

import { DIRECTION_LABELS } from "./constants";
import type { StackCardDirection, StackCardProps } from "./types";

export const useStackAccessibilityMenu = (
  index: number,
  enabled: boolean,
  directions: readonly StackCardDirection[],
  labels: StackCardProps["directionLabels"],
  send: (direction: StackCardDirection) => void
) => {
  const latest = useRef({ directions, enabled, index, send });
  latest.current = { directions, enabled, index, send };
  const mounted = useRef(true);
  const request = useRef(0);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      request.current += 1;
    };
  }, []);
  return async () => {
    if (!enabled || directions.length === 0) {
      return;
    }
    const menu = [...directions];
    request.current += 1;
    const version = request.current;
    try {
      const result = await showActionSheet({
        itemList: menu.map(
          (direction) => labels?.[direction] ?? DIRECTION_LABELS[direction]
        ),
      });
      if (
        !mounted.current ||
        version !== request.current ||
        !latest.current.enabled ||
        latest.current.index !== index ||
        menu.join("\0") !== latest.current.directions.join("\0")
      ) {
        return;
      }
      const direction = menu[result.tapIndex];
      if (direction) {
        latest.current.send(direction);
      }
    } catch {
      return false;
    }
  };
};
