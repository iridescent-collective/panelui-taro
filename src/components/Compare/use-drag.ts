import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import { selectionTick } from "../../lib/haptics";
import {
  readTouchPoints,
  readChangedTouchPoints,
} from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { clampRatio } from "./context";
import type { CompareOrientation } from "./types";
import type { CompareState } from "./use-state";

interface Configuration {
  disabled: boolean;
  orientation: CompareOrientation;
  extent: number;
  sign: number;
  haptics: boolean;
}
interface Drag {
  point: TouchPoint;
  start: number;
  scale: number;
  active: boolean;
  edge: boolean;
  reported: number;
}
export const useCompareDrag = (state: CompareState, config: Configuration) => {
  const current = useRef<Drag | null>(null);
  const latest = useRef({ config, state });
  latest.current = { config, state };
  const [active, setActive] = useState(false);
  const cancel = () => {
    if (!current.current) {
      return;
    }
    current.current = null;
    setActive(false);
    latest.current.state.cancel();
  };
  useEffect(() => {
    cancel();
  }, [config.disabled, config.orientation, config.extent, config.sign]);
  useEffect(
    () => () => {
      current.current = null;
    },
    []
  );
  const onTouchStart = (event: unknown) => {
    if (config.disabled || config.extent <= 0) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra) {
      cancel();
      return;
    }
    if (current.current) {
      cancel();
    }
    const start = state.begin();
    current.current = {
      active: false,
      edge: start <= 0 || start >= 1,
      point,
      reported: -1,
      scale: 375 / getWindowInfo().windowWidth,
      start,
    };
  };
  const onTouchMove = async (event: unknown) => {
    const drag = current.current;
    if (!drag) {
      return;
    }
    const [point, extra] = readTouchPoints(event);
    if (!point || extra || point.identifier !== drag.point.identifier) {
      cancel();
      return;
    }
    const { state: owner, config: settings } = latest.current;
    const x = (point.clientX - drag.point.clientX) * drag.scale;
    const y = (point.clientY - drag.point.clientY) * drag.scale;
    const horizontal = settings.orientation === "horizontal";
    const travel = horizontal ? x * settings.sign : y;
    if (!drag.active && Math.abs(horizontal ? y : x) > 16) {
      cancel();
      return;
    }
    if (!drag.active && Math.abs(travel) < 8) {
      return;
    }
    drag.active = true;
    setActive(true);
    const next = clampRatio(drag.start + travel / settings.extent);
    owner.update(next);
    const edge = next <= 0 || next >= 1;
    const tick = edge && edge !== drag.edge && settings.haptics;
    drag.edge = edge;
    const percent = Math.round(next * 100);
    if (percent !== drag.reported) {
      drag.reported = percent;
      owner.report(next);
    }
    if (tick) {
      await selectionTick();
    }
  };
  const onTouchEnd = (event: unknown) => {
    const drag = current.current;
    if (!drag) {
      return;
    }
    const [point, extra] = readChangedTouchPoints(event);
    if (extra || (point && point.identifier !== drag.point.identifier)) {
      cancel();
      return;
    }
    current.current = null;
    setActive(false);
    if (drag.active) {
      latest.current.state.finish();
    } else {
      latest.current.state.cancel();
    }
  };
  return {
    active,
    onTouchCancel: cancel,
    onTouchEnd,
    onTouchMove,
    onTouchStart,
  };
};
