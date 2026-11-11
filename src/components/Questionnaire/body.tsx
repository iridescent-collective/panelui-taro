import { View } from "@tarojs/components";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpringController } from "../../hooks/use-source-spring";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import {
  HEIGHT_DURATION,
  ENTER_DURATION,
  EXIT_DURATION,
  SLIDE_FRACTION,
} from "./constants";
import type { QuestionnaireBodyProps } from "./types";
import { useQuestionnairePan } from "./use-pan";
import { questionnaireVariants } from "./variants";

const DRAG_SPRING = { damping: 20, mass: 0.6, stiffness: 220 };
export const QuestionnaireBody = ({
  activeName,
  activeItem,
  activeIndex,
  framed,
  swipeable,
  canAdvance,
  canRetreat,
  onNext,
  onBack,
}: QuestionnaireBodyProps) => {
  const reduced = usePanelReducedMotion();
  const pane = useElementLayout(true, activeItem?.element);
  const body = useElementLayout(true, activeName);
  const height = useChartTween(-1, chartCubicOut);
  const enter = useChartTween(1, chartCubicOut);
  const exit = useChartTween(1);
  const drag = useSourceSpringController(0, DRAG_SPRING, reduced);
  const h = useSyncExternalStore(
    height.signal.subscribe,
    height.signal.getSnapshot,
    height.signal.getSnapshot
  );
  const p = useSyncExternalStore(
    enter.signal.subscribe,
    enter.signal.getSnapshot,
    enter.signal.getSnapshot
  );
  const fade = useSyncExternalStore(
    exit.signal.subscribe,
    exit.signal.getSnapshot,
    exit.signal.getSnapshot
  );
  const x = useSyncExternalStore(
    drag.signal.subscribe,
    drag.signal.getSnapshot,
    drag.signal.getSnapshot
  );
  const previous = useRef({
    activeIndex,
    activeName,
    element: activeItem?.element,
  });
  const [direction, setDirection] = useState(1);
  const [outgoing, setOutgoing] = useState<ReactNode>(null);
  useEffect(() => {
    const old = previous.current;
    previous.current = {
      activeIndex,
      activeName,
      element: activeItem?.element,
    };
    drag.setImmediate(0);
    if (old.activeName === activeName) {
      return;
    }
    setDirection(activeIndex >= old.activeIndex ? 1 : -1);
    if (reduced) {
      enter.setImmediate(1);
      setOutgoing(null);
      return;
    }
    setOutgoing(old.element);
    enter.setImmediate(0);
    enter.timingTo(1, ENTER_DURATION);
    exit.setImmediate(1);
    exit.timingTo(0, EXIT_DURATION);
    const timer = setTimeout(() => setOutgoing(null), EXIT_DURATION);
    return () => clearTimeout(timer);
  }, [
    activeName,
    activeIndex,
    reduced,
    drag.setImmediate,
    enter.setImmediate,
    enter.timingTo,
    exit.setImmediate,
    exit.timingTo,
  ]);
  useEffect(() => {
    const next = pane.layout?.height;
    if (!next || next <= 0) {
      return;
    }
    if (height.signal.value < 0 || reduced) {
      height.setImmediate(next);
    } else {
      height.timingTo(next, HEIGHT_DURATION);
    }
  }, [
    pane.layout?.height,
    reduced,
    height.setImmediate,
    height.timingTo,
    height.signal,
  ]);
  const width = body.layout?.width ?? 0;
  const pan = useQuestionnairePan({
    back: canRetreat,
    enabled: swipeable && width > 0,
    forward: canAdvance,
    name: activeName,
    navigate: (delta) => {
      if (delta === 1) {
        onNext();
      } else {
        onBack();
      }
    },
    release: () => drag.springTo(0),
    update: drag.setImmediate,
    width,
  });
  const slots = questionnaireVariants({ framed });
  const offset = width > 0 ? width * SLIDE_FRACTION : 60;
  return (
    <View
      id={body.id}
      className={`${slots.body()} relative`}
      catchMove={pan.active}
      onTouchStart={pan.onTouchStart}
      onTouchMove={pan.onTouchMove}
      onTouchEnd={pan.onTouchEnd}
      onTouchCancel={pan.onTouchCancel}
      style={h >= 0 ? { height: `${h * 2}rpx` } : undefined}
    >
      {outgoing === null ? null : (
        <View
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0"
          style={{ opacity: fade }}
        >
          {outgoing}
        </View>
      )}
      <View
        className={h >= 0 ? slots.slide() : "w-full"}
        style={{
          opacity: p,
          transform: `translateX(${direction * offset * (1 - p) * 2}rpx)`,
        }}
      >
        <View style={{ transform: `translateX(${x * 2}rpx)` }}>
          <View
            id={pane.id}
            className={slots.pane({ className: "flex flex-col" })}
            aria-live="polite"
          >
            {activeItem?.element ?? null}
          </View>
        </View>
      </View>
    </View>
  );
};
