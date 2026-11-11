import { useEffect, useRef, useSyncExternalStore } from "react";

import { useSourceSpringController } from "../../hooks/use-source-spring";
import { chartLinear, useChartTween } from "../../primitives/chart-tween";
import {
  DRAWER_ENTER_SPRING,
  DRAWER_RETURN_SPRING,
  DRAWER_EXIT_DURATION,
} from "./constants";

const quadOut = (value: number) => 1 - (1 - value) ** 2;
export const useDrawerMotion = (
  open: boolean,
  extent: number,
  reduced: boolean
) => {
  const entry = useSourceSpringController(extent, DRAWER_ENTER_SPRING, reduced);
  const travel = useSourceSpringController(
    extent,
    DRAWER_RETURN_SPRING,
    reduced
  );
  const exit = useChartTween(extent, quadOut, (value) =>
    travel.setImmediate(value)
  );
  const fade = useChartTween(0, chartLinear);
  const lastOpen = useRef(false);
  useEffect(() => {
    const opening = open && !lastOpen.current;
    lastOpen.current = open;
    entry.setImmediate(travel.read());
    exit.stop();
    if (open) {
      if (opening) {
        travel.setImmediate(reduced ? 0 : extent);
        entry.setImmediate(reduced ? 0 : extent);
      }
      entry.springTo(0);
      fade.timingTo(1, reduced ? 0 : 200);
    } else {
      entry.setImmediate(travel.read());
      exit.setImmediate(travel.read());
      if (reduced) {
        travel.setImmediate(extent);
      } else {
        exit.timingTo(extent, DRAWER_EXIT_DURATION);
      }
      fade.timingTo(0, reduced ? 0 : 200);
    }
  }, [
    open,
    extent,
    reduced,
    entry.setImmediate,
    entry.springTo,
    exit.setImmediate,
    exit.timingTo,
    exit.stop,
    fade.timingTo,
    travel.setImmediate,
    travel.read,
  ]);
  useEffect(
    () =>
      entry.signal.subscribe(() => {
        if (lastOpen.current) {
          travel.setImmediate(entry.signal.value);
        }
      }),
    [entry.signal, travel.setImmediate]
  );
  const shift = useSyncExternalStore(
    travel.signal.subscribe,
    travel.signal.getSnapshot,
    travel.signal.getSnapshot
  );
  const opacity = useSyncExternalStore(
    fade.signal.subscribe,
    fade.signal.getSnapshot,
    fade.signal.getSnapshot
  );
  return {
    begin: () => {
      entry.setImmediate(travel.read());
      exit.stop();
      travel.setImmediate(travel.read());
      return travel.read();
    },
    opacity,
    restore: () => travel.springTo(0),
    shift,
    update: travel.setImmediate,
  };
};
