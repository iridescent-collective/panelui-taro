import { View } from "@tarojs/components";
import { showActionSheet } from "@tarojs/taro";
import { useEffect, useRef, useState } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { useChartTween } from "../../primitives/chart-tween";
import { readTouchPoints } from "../../primitives/touch-event";
import type { TouchPoint } from "../../primitives/touch-event";
import { SLIDER_HIT, SLIDER_THUMB, SLIDER_TRACK } from "./constants";

export const sliderFraction = (y: number, track: number) =>
  Math.min(Math.max(1 - (y - SLIDER_THUMB / 2) / track, 0), 1);
export const SizeSlider = ({
  value,
  min,
  max,
  color,
  scale: inkScale,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  color: string;
  scale: number;
  onChange: (value: number) => void;
}) => {
  const { height: screenHeight, scale } = useWindowMetrics();
  const track = Math.min(SLIDER_TRACK, screenHeight * 0.18);
  const range = Math.max(max - min, 1);
  const [fraction, setFraction] = useState((value - min) / range);
  const fractionRef = useRef(fraction);
  const [opacity, setOpacity] = useState(0);
  const motion = useChartTween(0, undefined, setOpacity);
  const measured = useElementLayout(true, track, undefined, false);
  const contact = useRef<{
    ended: boolean;
    point: TouchPoint;
    top: number | null;
  } | null>(null);
  const mounted = useRef(true);
  const version = useRef(0);
  const latest = useRef({ max, min, onChange, value });
  latest.current = { max, min, onChange, value };
  useEffect(() => {
    version.current += 1;
  }, [value, min, max, onChange]);
  useEffect(() => {
    fractionRef.current = (value - min) / range;
    setFraction(fractionRef.current);
  }, [value, min, range]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      contact.current = null;
      version.current += 1;
    };
  }, []);
  const applyPoint = (point: TouchPoint, top: number) => {
    const next = sliderFraction(point.clientY * scale - top, track);
    fractionRef.current = next;
    setFraction(next);
  };
  const update = (event: unknown) => {
    const owner = contact.current;
    const [point, extra] = readTouchPoints(event);
    if (
      !owner ||
      owner.ended ||
      !point ||
      extra ||
      point.identifier !== owner.point.identifier
    ) {
      return;
    }
    owner.point = point;
    if (owner.top !== null) {
      applyPoint(point, owner.top);
    }
  };
  const finish = () => {
    const owner = contact.current;
    if (!owner || owner.ended) {
      return;
    }
    motion.timingTo(0, 200);
    if (owner.top === null) {
      owner.ended = true;
      return;
    }
    contact.current = null;
    onChange(Math.round(min + fractionRef.current * range));
  };
  const diameter = (min + fraction * range) * inkScale;
  const adjust = async () => {
    version.current += 1;
    const request = version.current;
    const snapshot = latest.current;
    try {
      const result = await showActionSheet({
        itemList: ["Increase stroke width", "Decrease stroke width"],
      });
      if (
        !mounted.current ||
        request !== version.current ||
        latest.current.value !== snapshot.value ||
        latest.current.min !== snapshot.min ||
        latest.current.max !== snapshot.max ||
        latest.current.onChange !== snapshot.onChange
      ) {
        return;
      }
      const step = Math.max(1, Math.round(range / 10));
      onChange(
        result.tapIndex === 0
          ? Math.min(value + step, max)
          : Math.max(value - step, min)
      );
    } catch {
      return false;
    }
  };
  return (
    <View className="absolute top-0 bottom-0 left-0 z-10 flex justify-center">
      <View
        id={measured.id}
        aria-role="slider"
        aria-label="Stroke width"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        className="relative flex items-center"
        style={{
          height: `${(track + SLIDER_THUMB) * 2}rpx`,
          width: `${(SLIDER_HIT + 16) * 2}rpx`,
        }}
        onTouchStart={(event) => {
          const [point, extra] = readTouchPoints(event);
          if (!point || extra) {
            return;
          }
          const owner = { ended: false, point, top: null as number | null };
          contact.current = owner;
          motion.timingTo(1, 120);
          measured.refresh(
            () => mounted.current && contact.current === owner,
            (box) => {
              if (!box) {
                contact.current = null;
                motion.timingTo(0, 200);
                return;
              }
              owner.top = box.top;
              applyPoint(owner.point, owner.top);
              if (owner.ended) {
                contact.current = null;
                latest.current.onChange(
                  Math.round(
                    latest.current.min +
                      fractionRef.current *
                        Math.max(latest.current.max - latest.current.min, 1)
                  )
                );
              }
            }
          );
        }}
        onTouchMove={update}
        onTouchEnd={finish}
        onTouchCancel={finish}
        onLongPress={() => {
          contact.current = null;
          motion.timingTo(0, 200);
          void adjust();
        }}
      >
        <View
          className="absolute w-[4px] rounded-full bg-[var(--panel-muted-foreground)] opacity-40"
          style={{ height: `${track * 2}rpx`, top: `${SLIDER_THUMB}rpx` }}
        />
        <View
          className="absolute top-0 h-[56px] w-[56px] rounded-full border border-[var(--panel-border)] bg-[var(--panel-muted)]"
          style={{ transform: `translateY(${(1 - fraction) * track * 2}rpx)` }}
        />
        <View
          aria-hidden
          className="absolute top-0"
          style={{
            backgroundColor: color,
            borderRadius: `${diameter}rpx`,
            height: `${diameter * 2}rpx`,
            left: `${(SLIDER_HIT + 12) * 2}rpx`,
            opacity,
            pointerEvents: "none",
            transform: `translateY(${((1 - fraction) * track + SLIDER_THUMB / 2 - diameter / 2) * 2}rpx)`,
            width: `${diameter * 2}rpx`,
          }}
        />
      </View>
    </View>
  );
};
