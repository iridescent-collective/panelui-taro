import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
  nextTick,
} from "@tarojs/taro";
import { useEffect, useMemo, useRef, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useSpringNumber } from "../../hooks/use-spring-number";
import { weappNodeSelector } from "../../platform/node-selector";
import { LAYOUT_SPRING } from "./constants";
import type { AnimatedBadgeProps, AnimatedBadgeStatus } from "./types";

export const useBadgeWidth = (
  id: string,
  props: AnimatedBadgeProps,
  status: AnimatedBadgeStatus,
  labelKey: string | number,
  reduced: boolean
) => {
  const {
    className,
    labelClassName,
    style,
    size,
    children,
    icon,
    showIcon,
    animateLayout = true,
  } = props;
  const inputs = useMemo(
    () => ({
      children,
      className,
      icon,
      labelClassName,
      labelKey,
      showIcon,
      size,
      status,
      style,
    }),
    [
      children,
      className,
      icon,
      labelClassName,
      labelKey,
      showIcon,
      size,
      status,
      style,
    ]
  );
  const natural = useElementLayout(true, inputs, `${id}-content`, false);
  const [padding, setPadding] = useState(0);
  const [armed, setArmed] = useState(false);
  const first = useRef<string | null>(null);
  const { value, setImmediate, springTo } = useSpringNumber(
    0,
    LAYOUT_SPRING,
    reduced
  );
  useEffect(() => {
    const key = `${status}\u0000${labelKey}`;
    if (first.current === null) {
      first.current = key;
    } else if (key !== first.current) {
      setArmed(true);
    }
  }, [status, labelKey]);
  useEffect(() => {
    let mounted = true;
    nextTick(() => {
      if (!mounted) {
        return;
      }
      const query = createSelectorQuery();
      const { page } = getCurrentInstance();
      if (page) {
        query.in(page);
      }
      query
        .select(weappNodeSelector(id))
        .fields(
          {
            computedStyle: [
              "padding-left",
              "padding-right",
              "border-left-width",
              "border-right-width",
            ],
          },
          (result: unknown) => {
            if (
              !mounted ||
              !result ||
              typeof result !== "object" ||
              Array.isArray(result)
            ) {
              return;
            }
            let chrome = 0;
            for (const key of [
              "padding-left",
              "padding-right",
              "border-left-width",
              "border-right-width",
            ]) {
              if (!(key in result)) {
                continue;
              }
              const raw = Reflect.get(result, key);
              const amount =
                typeof raw === "string" ? Number(raw.replace(/px$/u, "")) : 0;
              if (Number.isFinite(amount)) {
                chrome += amount;
              }
            }
            setPadding((chrome * 375) / getWindowInfo().windowWidth);
          }
        )
        .exec();
    });
    return () => {
      mounted = false;
    };
  }, [className, id, size, style]);
  const width = (natural.layout?.width ?? 0) + padding;
  useEffect(() => {
    if (!natural.layout) {
      return;
    }
    if (reduced || !animateLayout || !armed) {
      setImmediate(width);
    } else {
      springTo(width);
    }
  }, [
    width,
    natural.layout,
    reduced,
    animateLayout,
    armed,
    setImmediate,
    springTo,
  ]);
  return {
    contentId: natural.id,
    width: animateLayout && armed && !reduced && width > 0 ? value : undefined,
  };
};
