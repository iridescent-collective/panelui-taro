import { View } from "@tarojs/components";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactElement } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSpringNumber } from "../../hooks/use-spring-number";
import { useDirection } from "../Direction";
import type { TabsContentProps } from "./types";
import { usePagerDrag } from "./use-pager-drag";

const FILL = { flexBasis: "auto", flexGrow: 1, flexShrink: 1 } as const;
const SPRING = { damping: 22, mass: 0.6, stiffness: 240 };
export const TabsPager = ({
  panels,
  value,
  setValue,
  keepMounted,
  animationDisabled,
}: {
  panels: ReactElement<TabsContentProps>[];
  value: string;
  setValue: (value: string) => void;
  keepMounted: boolean;
  animationDisabled: boolean;
}) => {
  const direction = useDirection();
  const reduced = usePanelReducedMotion();
  const sign = direction === "rtl" ? -1 : 1;
  const order = useMemo(
    () => panels.map((panel) => panel.props.value),
    [panels]
  );
  const resolved = order.indexOf(value);
  const lastResolved = useRef(0);
  if (order.includes(value)) {
    lastResolved.current = resolved;
  }
  const active =
    resolved === -1
      ? Math.min(lastResolved.current, panels.length - 1)
      : resolved;
  const measure = useElementLayout(true, panels);
  const width = measure.layout?.width ?? 0;
  const motion = useSpringNumber(
    active,
    SPRING,
    animationDisabled || reduced || width === 0
  );
  const drag = usePagerDrag({
    active,
    count: panels.length,
    motion,
    onSelect: (index) => {
      const next = order[index];
      if (next !== undefined) {
        setValue(next);
      }
    },
    sign,
    width,
  });
  const [reached, setReached] = useState<string[]>(() =>
    order[active] ? [order[active]] : []
  );
  useEffect(() => {
    const wanted = keepMounted
      ? order
      : [order[active - 1], order[active + 1]].filter(
          (tab): tab is string => tab !== undefined
        );
    const timer = setTimeout(
      () =>
        setReached((current) => {
          const missing = wanted.filter((tab) => !current.includes(tab));
          return missing.length > 0 ? [...current, ...missing] : current;
        }),
      0
    );
    return () => clearTimeout(timer);
  }, [active, keepMounted, order]);
  const activeValue = order[active];
  if (activeValue !== undefined && !reached.includes(activeValue)) {
    setReached((current) =>
      current.includes(activeValue) ? current : [...current, activeValue]
    );
  }
  return (
    <View
      id={measure.id}
      className="relative flex min-h-0 min-w-0 flex-col overflow-hidden"
      style={FILL}
    >
      {width === 0 ? (
        panels[active]
      ) : (
        <View
          {...drag}
          className="flex min-h-0 flex-row"
          style={{
            ...FILL,
            transform: `translateX(${-motion.value * width * sign * 2}rpx)`,
            width: `${width * panels.length * 2}rpx`,
          }}
        >
          {panels.map((panel) => (
            <View
              key={panel.props.value}
              className="flex min-h-0 min-w-0 shrink-0 flex-col"
              style={{ ...FILL, width: `${width * 2}rpx` }}
            >
              {keepMounted ||
              reached.includes(panel.props.value) ||
              panel.props.value === activeValue
                ? panel
                : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
