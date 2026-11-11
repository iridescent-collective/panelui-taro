import {
  createSelectorQuery,
  getCurrentInstance,
  nextTick,
} from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import { weappNodeSelector } from "../platform/node-selector";
import { PRESS_RELEASE_DURATION } from "./press-feedback-constants";

const inlineOpacity = (style?: CSSProperties | string) => {
  if (typeof style !== "string") {
    return style?.opacity;
  }
  let value: string | undefined;
  for (const declaration of style.split(";")) {
    const [key, entry] = declaration.split(":");
    if (key?.trim() === "opacity") {
      value = entry?.trim();
    }
  }
  return value;
};
const numericOpacity = (value: unknown): number | undefined => {
  if (typeof value !== "number" && typeof value !== "string") {
    return undefined;
  }
  if (typeof value === "string" && !value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : undefined;
};

export const useRestingOpacity = (
  id: string,
  enabled: boolean,
  className?: string,
  style?: CSSProperties | string,
  pressed = false
) => {
  const [scope] = useState(() => getCurrentInstance().page);
  const sampled = useRef<string>();
  const settling = useRef(false);
  const [measured, setMeasured] = useState(1);
  const explicit = numericOpacity(inlineOpacity(style));
  const styleKey = typeof style === "string" ? style : JSON.stringify(style);
  const key = `${id}:${className ?? ""}:${styleKey ?? ""}`;
  useEffect(() => {
    if (pressed) {
      settling.current ||= enabled && explicit === undefined;
      return;
    }
    if (!enabled || explicit !== undefined) {
      return;
    }
    if (sampled.current === key) {
      return;
    }
    let active = true;
    const measure = () =>
      nextTick(() => {
        if (!active) {
          return;
        }
        const query = createSelectorQuery();
        if (scope) {
          query.in(scope);
        }
        query
          .select(weappNodeSelector(id))
          .fields({ computedStyle: ["opacity"] }, (result) => {
            if (active) {
              sampled.current = key;
              settling.current = false;
              setMeasured(numericOpacity(result?.opacity) ?? 1);
            }
          })
          .exec();
      });
    const timer = settling.current
      ? setTimeout(measure, PRESS_RELEASE_DURATION)
      : undefined;
    if (timer === undefined) {
      measure();
    }
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [id, enabled, key, explicit, scope, pressed]);
  return explicit ?? measured;
};
