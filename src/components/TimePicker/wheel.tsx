import { View } from "@tarojs/components";
import { useMemo } from "react";

import { useNativeScrollMetrics } from "../../hooks/use-native-scroll-metrics";
import {
  displayHour,
  hourFromDisplay,
  meridiemLabels,
  meridiemOf,
  padTwo,
} from "../../lib/time";
import { Column } from "./column";
import { COLUMN_HEIGHT, ROW_HEIGHT } from "./constants";
import type { FaceProps } from "./types";
import { timePickerVariants } from "./variants";

export const WheelFace = ({
  value,
  onValueChange,
  syncToken,
  hourCycle,
  minuteStep,
  locale,
  disabled,
}: FaceProps) => {
  const slots = timePickerVariants();
  const { pixelSpacing } = useNativeScrollMetrics(ROW_HEIGHT);
  const meridiems = useMemo(() => meridiemLabels(locale), [locale]);
  const hours = useMemo(
    () =>
      hourCycle === 24
        ? Array.from({ length: 24 }, (_, i) => i)
        : Array.from({ length: 12 }, (_, i) => i + 1),
    [hourCycle]
  );
  const minutes = useMemo(
    () =>
      Array.from(
        { length: Math.ceil(60 / minuteStep) },
        (_, i) => i * minuteStep
      ),
    [minuteStep]
  );
  const hourIndex = Math.max(
    0,
    hours.indexOf(displayHour(value.hour, hourCycle))
  );
  const minuteIndex = Math.min(
    minutes.length - 1,
    Math.round(value.minute / minuteStep)
  );
  const meridiemIndex = meridiemOf(value.hour) === "am" ? 0 : 1;
  return (
    <View
      className={slots.wheel()}
      style={{ height: `${(pixelSpacing * COLUMN_HEIGHT) / ROW_HEIGHT}px` }}
    >
      <View
        className={slots.highlight()}
        style={{
          height: `${pixelSpacing}px`,
          pointerEvents: "none",
          top: `${(pixelSpacing * (COLUMN_HEIGHT / ROW_HEIGHT - 1)) / 2}px`,
        }}
      />
      <Column
        items={hours}
        index={hourIndex}
        syncToken={syncToken}
        onIndexChange={(index) =>
          onValueChange({
            ...value,
            hour: hourFromDisplay(
              hours[index] ?? 0,
              meridiemOf(value.hour),
              hourCycle
            ),
          })
        }
        label={(hour) => (hourCycle === 24 ? padTwo(hour) : String(hour))}
        disabled={disabled}
        accessibilityLabel="Hour"
        className={slots.column()}
      />
      <Column
        items={minutes}
        index={minuteIndex}
        syncToken={syncToken}
        onIndexChange={(index) =>
          onValueChange({ ...value, minute: minutes[index] ?? 0 })
        }
        label={padTwo}
        disabled={disabled}
        accessibilityLabel="Minute"
        className={slots.column()}
      />
      {hourCycle === 12 ? (
        <Column
          items={meridiems}
          index={meridiemIndex}
          syncToken={syncToken}
          onIndexChange={(index) =>
            onValueChange({
              ...value,
              hour:
                index === meridiemIndex
                  ? value.hour
                  : value.hour + (index === 1 ? 12 : -12),
            })
          }
          label={(entry) => entry}
          disabled={disabled}
          accessibilityLabel="AM or PM"
          className={slots.column()}
        />
      ) : null}
    </View>
  );
};
