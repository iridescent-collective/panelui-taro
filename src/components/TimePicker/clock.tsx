import { View } from "@tarojs/components";
import { useMemo } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useSourceSpring } from "../../hooks/use-source-spring";
import { formatTime, timeToMinutes } from "../../lib/time";
import type { TimeValue } from "../../lib/time";
import { CanvasGraphics } from "../../primitives/canvas-graphics";
import { Circle } from "../../primitives/static-svg";
import { useThemeToken } from "../../theme/use-theme";
import { Column } from "./column";
import { FACE_CENTRE, FACE_SIZE, HAND_SPRING } from "./constants";
import { boundedTimes, handEnd, nearestTimeIndex } from "./math";
import type { FaceProps } from "./types";
import { timePickerVariants } from "./variants";

const Line = "line" as const;
export const ClockFace = ({ value }: { value: TimeValue }) => {
  const tick = useThemeToken("muted-foreground");
  const hand = useThemeToken("foreground");
  const dial = useThemeToken("muted");
  const reduced = usePanelReducedMotion();
  const progress = useSourceSpring(timeToMinutes(value), HAND_SPRING, reduced);
  return (
    <CanvasGraphics
      width={FACE_SIZE}
      height={FACE_SIZE}
      viewBox={`0 0 ${FACE_SIZE} ${FACE_SIZE}`}
    >
      <Circle
        cx={FACE_CENTRE}
        cy={FACE_CENTRE}
        r={FACE_CENTRE - 2}
        fill={dial}
      />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * 2 * Math.PI - Math.PI / 2;
        const outer = FACE_CENTRE - 10;
        const inner = outer - (i % 3 === 0 ? 9 : 6);
        return (
          <Line
            key={i}
            x1={FACE_CENTRE + Math.cos(angle) * inner}
            y1={FACE_CENTRE + Math.sin(angle) * inner}
            x2={FACE_CENTRE + Math.cos(angle) * outer}
            y2={FACE_CENTRE + Math.sin(angle) * outer}
            stroke={tick}
            strokeWidth={i % 3 === 0 ? 2 : 1}
            strokeLinecap="round"
          />
        );
      })}
      <Line
        {...handEnd((progress % 720) / 720, 34)}
        stroke={hand}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Line
        {...handEnd((progress % 60) / 60, 48)}
        stroke={hand}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Circle cx={FACE_CENTRE} cy={FACE_CENTRE} r={3} fill={hand} />
    </CanvasGraphics>
  );
};
export const ClockFaceLayout = (props: FaceProps) => {
  const {
    value,
    minuteStep,
    minTime,
    maxTime,
    locale,
    hourCycle,
    disabled,
    syncToken,
    onValueChange,
  } = props;
  const times = useMemo(
    () => boundedTimes(minuteStep, minTime, maxTime),
    [minuteStep, minTime, maxTime]
  );
  const index = nearestTimeIndex(times, value);
  const slots = timePickerVariants();
  return (
    <View className={slots.clock()}>
      <ClockFace value={value} />
      <Column
        items={times}
        index={index}
        syncToken={syncToken}
        onIndexChange={(next) => {
          if (times[next]) {
            onValueChange(times[next]);
          }
        }}
        label={(time) => formatTime(time, { hourCycle, locale })}
        disabled={disabled}
        accessibilityLabel="Time"
        className={slots.column()}
      />
    </View>
  );
};
