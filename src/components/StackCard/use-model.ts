import {
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type { Ref } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { impactKnock, selectionTick } from "../../lib/haptics";
import { startSourceSpring, stepSourceSpring } from "../../lib/source-spring";
import { useControllableState } from "../../primitives/controllable-state";
import { createObservableNumber } from "../../primitives/observable-number";
import { createObservableValue } from "../../primitives/observable-value";
import { ARRIVE_SPRING, RETURN_SPRING } from "./constants";
import { exitDuration, exitTarget, releaseProgress } from "./geometry";
import { stackExitEase } from "./motion";
import type {
  StackCardDirection,
  StackCardHandle,
  StackCardProps,
  StackFrame,
} from "./types";

export const useStackModel = (
  props: StackCardProps,
  count: number,
  width: number,
  height: number,
  ref: Ref<StackCardHandle>
) => {
  const {
    index: indexProp,
    defaultIndex = 0,
    onIndexChange,
    onSwipe,
    onEmpty,
    threshold = 0.3,
    haptics = true,
    disabled = false,
  } = props;
  const { value: index, setValue: setIndex } = useControllableState({
    defaultValue: defaultIndex,
    onChange: onIndexChange,
    value: indexProp,
  });
  const reduced = usePanelReducedMotion();
  const signal = useMemo(
    () =>
      createObservableValue<StackFrame>({
        active: index,
        fade: 1,
        height,
        pivot: 1,
        release: 0,
        width,
        x: 0,
        y: 0,
      }),
    []
  );
  const release = useMemo(() => createObservableNumber(0), []);
  const [, answer] = useReducer((renders: number) => renders + 1, 0);
  const latest = useRef({
    count,
    disabled,
    haptics,
    height,
    index,
    onEmpty,
    onSwipe,
    reduced,
    setIndex,
    threshold,
    width,
  });
  latest.current = {
    count,
    disabled,
    haptics,
    height,
    index,
    onEmpty,
    onSwipe,
    reduced,
    setIndex,
    threshold,
    width,
  };
  const allowed = props.directions ?? ["left", "right"];
  const domain = allowed.join("\0");
  const latestAllowed = useRef(allowed);
  latestAllowed.current = allowed;
  const history = useRef<StackCardDirection[]>([]);
  const drawn = useRef(index);
  const requested = useRef<{
    from: number;
    direction: StackCardDirection;
  } | null>(null);
  const arriving = useRef<StackCardDirection | null>(null);
  const leaving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const revision = useRef(0);
  const stopContact = useRef<(() => void) | null>(null);
  const stop = () => {
    revision.current += 1;
    if (timer.current !== null) {
      clearTimeout(timer.current);
    }
    timer.current = null;
    leaving.current = false;
  };
  const publish = (next: Partial<StackFrame>) => {
    const frame = {
      ...signal.value,
      ...next,
      height: latest.current.height,
      width: latest.current.width,
    };
    frame.release = releaseProgress(
      latestAllowed.current,
      frame.x,
      frame.y,
      frame.width,
      frame.height,
      latest.current.threshold
    );
    if (
      frame.release >= 1 &&
      signal.value.release < 1 &&
      latest.current.haptics
    ) {
      void selectionTick();
    }
    signal.value = frame;
    release.value = frame.release;
  };
  const settle = (next: number) => {
    stop();
    publish({ active: next, fade: 1, x: 0, y: 0 });
  };
  const restore = (vx = 0, vy = 0, arrival = false) => {
    stop();
    const config = arrival ? ARRIVE_SPRING : RETURN_SPRING;
    const sx = startSourceSpring(signal.value.x, 0, vx, {
      ...config,
      velocity: vx,
    });
    const sy = startSourceSpring(signal.value.y, 0, vy, {
      ...config,
      velocity: vy,
    });
    if (latest.current.reduced) {
      publish({ fade: 1, x: 0, y: 0 });
      return;
    }
    const version = revision.current;
    let last = Date.now();
    const draw = () => {
      if (revision.current !== version) {
        return;
      }
      const now = Date.now();
      const dx = stepSourceSpring(sx, now - last);
      const dy = stepSourceSpring(sy, now - last);
      last = now;
      publish({ x: sx.position, y: sy.position });
      timer.current = dx && dy ? null : setTimeout(draw, 16);
    };
    timer.current = setTimeout(draw, 16);
  };
  const launch = (
    direction: StackCardDirection,
    velocityX = 0,
    velocityY = 0
  ) => {
    const from = signal.value.active;
    if (leaving.current || from >= latest.current.count) {
      return;
    }
    stopContact.current?.();
    stop();
    leaving.current = true;
    const origin = signal.value;
    const target = exitTarget(
      direction,
      origin.width || 320,
      origin.height || 420,
      origin.x,
      origin.y
    );
    const sideways = direction === "left" || direction === "right";
    const distance = sideways ? target.x - origin.x : target.y - origin.y;
    const along = sideways ? velocityX : velocityY;
    const speed = along * distance > 0 ? Math.abs(along) : 0;
    const duration = latest.current.reduced
      ? 160
      : exitDuration(distance, speed, 2, 420, 540);
    const start = Date.now();
    const version = revision.current;
    const draw = () => {
      if (revision.current !== version) {
        return;
      }
      const t = Math.min(1, (Date.now() - start) / duration);
      if (latest.current.reduced) {
        publish({ fade: 1 - t });
      } else {
        const eased = stackExitEase(t);
        publish({
          x: origin.x + (target.x - origin.x) * eased,
          y: origin.y + (target.y - origin.y) * eased,
        });
      }
      if (t < 1) {
        timer.current = setTimeout(
          draw,
          Math.min(16, duration - (Date.now() - start))
        );
        return;
      }
      settle(from + 1);
      drawn.current = from + 1;
      requested.current = { direction, from };
      history.current.push(direction);
      latest.current.onSwipe?.(direction, from);
      latest.current.setIndex(from + 1);
      answer();
      if (latest.current.haptics) {
        void impactKnock();
      }
    };
    timer.current = setTimeout(draw, Math.min(16, duration));
  };
  const undo = () => {
    if (drawn.current <= 0) {
      return;
    }
    arriving.current = history.current.pop() ?? "left";
    setIndex(drawn.current - 1);
  };
  const reset = () => {
    stopContact.current?.();
    history.current = [];
    arriving.current = null;
    requested.current = null;
    drawn.current = 0;
    settle(0);
    setIndex(0);
    answer();
  };
  useImperativeHandle(ref, () => ({ reset, swipe: launch, undo }));
  useEffect(() => {
    const asked = requested.current;
    requested.current = null;
    if (asked && index === asked.from) {
      history.current.pop();
      arriving.current = asked.direction;
    }
    if (drawn.current === index) {
      return;
    }
    drawn.current = index;
    const entrance = arriving.current;
    arriving.current = null;
    stopContact.current?.();
    settle(index);
    if (entrance && !reduced) {
      const target = exitTarget(entrance, width || 320, height || 420, 0, 0);
      publish(target);
      restore(0, 0, true);
    }
  });
  const reportedEmpty = useRef(false);
  useEffect(() => {
    if (index >= count && count > 0 && !reportedEmpty.current) {
      reportedEmpty.current = true;
      onEmpty?.();
    }
    if (index < count) {
      reportedEmpty.current = false;
    }
  }, [count, index, onEmpty]);
  useEffect(() => {
    publish({ height, width });
  }, [width, height, domain, threshold]);
  useEffect(
    () => () => {
      stop();
      stopContact.current?.();
    },
    []
  );
  return {
    allowed,
    begin: (pivot: number) => {
      stop();
      publish({ fade: 1, pivot });
      return signal.value;
    },
    context: {
      canUndo: index > 0,
      count,
      disabled,
      index,
      release,
      reset,
      send: launch,
      signal,
      threshold,
      undo,
    },
    domain,
    launch,
    leaving,
    publish,
    restore,
    signal,
    stopContact,
  };
};
