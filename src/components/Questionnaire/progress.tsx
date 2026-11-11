import { View } from "@tarojs/components";
import { useEffect, useSyncExternalStore } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { cn } from "../../lib/utils";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { chartCubicOut, useChartTween } from "../../primitives/chart-tween";
import { Circle } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { PIP_DURATION, RING_SIZE, RING_STROKE, MAX_PIPS } from "./constants";
import { useQuestionnaire } from "./context";
import type { QuestionnaireProgressProps } from "./types";

const useProgressTween = (value: number) => {
  const reduced = usePanelReducedMotion();
  const tween = useChartTween(value, chartCubicOut);
  useEffect(() => {
    if (reduced) {
      tween.setImmediate(value);
    } else {
      tween.timingTo(value, PIP_DURATION);
    }
  }, [value, reduced, tween.setImmediate, tween.timingTo]);
  return useSyncExternalStore(
    tween.signal.subscribe,
    tween.signal.getSnapshot,
    tween.signal.getSnapshot
  );
};
const ProgressRing = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => {
  const fill = useThemeToken("primary");
  const track = useThemeToken("border");
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const centre = RING_SIZE / 2;
  const fraction = useProgressTween(
    total > 0 ? Math.min(Math.max(current / total, 0), 1) : 0
  );
  return (
    <CanvasGraphics
      width={RING_SIZE}
      height={RING_SIZE}
      viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
    >
      <Circle
        cx={centre}
        cy={centre}
        r={radius}
        stroke={track}
        strokeWidth={RING_STROKE}
        fill="none"
      />
      <Circle
        cx={centre}
        cy={centre}
        r={radius}
        stroke={fill}
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        strokeDasharray={`${circumference * fraction} ${circumference}`}
        fill="none"
        transform={`rotate(-90 ${centre} ${centre})`}
      />
    </CanvasGraphics>
  );
};
const ProgressPip = ({
  filled,
  active,
}: {
  filled: boolean;
  active: boolean;
}) => {
  const fill = useProgressTween(filled ? 1 : 0);
  return (
    <View
      className={cn(
        "h-[8px] overflow-hidden rounded-full bg-[var(--panel-border)]",
        active ? "w-[40px]" : "w-[20px]"
      )}
    >
      <View
        style={{ opacity: fill }}
        className="h-full w-full rounded-full bg-[var(--panel-primary)]"
      />
    </View>
  );
};
const ProgressNumber = ({
  value,
  done,
  active,
}: {
  value: number;
  done: boolean;
  active: boolean;
}) => {
  let surface = "border-[var(--panel-border)] bg-[var(--panel-muted)]";
  let text = "text-[color:var(--panel-muted-foreground)]";
  if (active) {
    surface = "border-[var(--panel-primary)] bg-[var(--panel-primary)]";
    text = "text-[color:var(--panel-primary-foreground)]";
  } else if (done) {
    surface =
      "border-[var(--panel-primary-opacity-40)] bg-[var(--panel-primary-opacity-10)]";
    text = "text-[color:var(--panel-primary)]";
  }
  return (
    <View
      className={cn(
        "flex h-[40px] w-[40px] flex-col items-center justify-center rounded-full border-[2px] border-solid",
        surface
      )}
    >
      <Text className={cn("text-[22px] font-medium tabular-nums", text)}>
        {value}
      </Text>
    </View>
  );
};
export const QuestionnaireProgress = ({
  className,
  variant = "ring",
  children,
}: QuestionnaireProgressProps) => {
  const { current, total, first, last } = useQuestionnaire(
    "Questionnaire.Progress"
  );
  const label = `Question ${current} of ${total}`;
  const drawable =
    variant !== "count" && variant !== "ring" && total > 0 && total <= MAX_PIPS;
  let fallback = (
    <Text size="sm" muted className="tabular-nums">
      {label}
    </Text>
  );
  if (variant === "ring") {
    fallback = <ProgressRing current={current} total={total} />;
  } else if (drawable) {
    fallback = (
      <View
        className={cn(
          "flex flex-row items-center",
          variant === "numbers" ? "gap-[12px]" : "gap-[8px]"
        )}
      >
        {Array.from({ length: total }, (_, index) =>
          variant === "numbers" ? (
            <ProgressNumber
              key={index}
              value={index + 1}
              done={index < current - 1}
              active={index === current - 1}
            />
          ) : (
            <ProgressPip
              key={index}
              filled={index < current}
              active={index === current - 1}
            />
          )
        )}
      </View>
    );
  }
  const content =
    typeof children === "function"
      ? children({ current, first, last, total })
      : (children ?? fallback);
  return (
    <View
      role="progressbar"
      aria-role="progressbar"
      aria-label="Questionnaire progress"
      aria-valuemin={1}
      aria-valuemax={Math.max(total, 1)}
      aria-valuenow={current}
      aria-valuetext={label}
      className={className}
    >
      {textChildren(content, (text) => (
        <Text size="sm" muted className="tabular-nums">
          {text}
        </Text>
      ))}
    </View>
  );
};
QuestionnaireProgress.displayName = "Questionnaire.Progress";
