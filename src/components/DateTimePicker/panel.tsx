import { View } from "@tarojs/components";

import { formatTime } from "../../lib/time";
import { cn } from "../../lib/utils";
import { Calendar } from "../Calendar";
import { Text } from "../primitives/Text";
import { TimePicker } from "../TimePicker";
import { DISABLE_ALL_DATES, PANEL_WIDTH } from "./constants";
import type { DateTimePickerProps } from "./types";
import type { useDateTimePicker } from "./use-model";

interface PanelProps {
  source: DateTimePickerProps;
  model: ReturnType<typeof useDateTimePicker>;
}
export const DateTimePanel = ({ source, model }: PanelProps) => {
  const {
    value,
    time,
    fallback,
    handleDay,
    handleTime,
    layout,
    hourCycle,
    disabled,
  } = model;
  const {
    presentation = "popover",
    className,
    disabledDates,
    minDate,
    maxDate,
    captionLayout = "label",
    weekStartsOn = 0,
    locale,
    calendar = "gregory",
    timeLabel = "Time",
    minuteStep,
    minTime,
    maxTime,
  } = source;
  return (
    <View
      style={{ maxWidth: "100%", width: `${PANEL_WIDTH * 2}rpx` }}
      className={cn(
        "flex flex-col self-center",
        presentation === "inline" ? className : undefined
      )}
    >
      <Calendar
        bordered={false}
        mode="single"
        selected={value}
        onSelect={handleDay}
        disabled={disabled ? DISABLE_ALL_DATES : disabledDates}
        minDate={minDate}
        maxDate={maxDate}
        startMonth={minDate}
        endMonth={maxDate}
        captionLayout={captionLayout}
        weekStartsOn={weekStartsOn}
        locale={locale}
        calendar={calendar}
      />
      <View className="mt-[24px] flex flex-col gap-[24px] border-t-[2px] border-solid border-[color:var(--panel-border)] pt-[24px]">
        <View className="flex flex-row items-center justify-between gap-[24px]">
          <Text size="sm" muted>
            {timeLabel}
          </Text>
          <Text className="text-[36px] leading-[1.555556] font-semibold text-[color:var(--panel-foreground)] tabular-nums">
            {formatTime(time ?? fallback, { hourCycle, locale })}
          </Text>
        </View>
        <TimePicker
          presentation="inline"
          layout={layout}
          readout="none"
          value={time}
          onValueChange={handleTime}
          hourCycle={hourCycle}
          minuteStep={minuteStep}
          minTime={minTime}
          maxTime={maxTime}
          locale={locale}
          disabled={disabled}
        />
      </View>
    </View>
  );
};
