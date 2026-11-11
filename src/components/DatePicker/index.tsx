import { View } from "@tarojs/components";
import { useCallback, useMemo, useState } from "react";
import type { ReactElement } from "react";

import { CalendarIcon } from "../../icons";
import { resolveCalendar } from "../../lib/date";
import { cn } from "../../lib/utils";
import { Button } from "../Button";
import { Calendar } from "../Calendar";
import type { CalendarSelection, DateRange } from "../Calendar";
import { Popover } from "../Popover";
import { Text } from "../primitives/Text";
import { describe, DEFAULT_PLACEHOLDER } from "./describe";
import type { DatePickerProps, DatePickerMode } from "./types";

export type { DatePickerProps, DatePickerMode } from "./types";
const DatePickerRoot = <Mode extends DatePickerMode = "single">({
  mode = "single" as Mode,
  selected,
  defaultSelected,
  onSelect,
  open: openProp,
  onOpenChange,
  placeholder = DEFAULT_PLACEHOLDER,
  format,
  presentation = "popover",
  disabled = false,
  disabledDates,
  minDate,
  maxDate,
  startMonth,
  endMonth,
  numberOfMonths = 1,
  captionLayout = "label",
  weekStartsOn = 0,
  selectOutsideDays = false,
  locale,
  calendar = "gregory",
  className,
  children,
}: DatePickerProps<Mode>) => {
  const system = useMemo(
    () => resolveCalendar(calendar, locale),
    [calendar, locale]
  );
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalSelected, setInternalSelected] = useState<
    CalendarSelection[Mode] | undefined
  >(defaultSelected);
  const isOpenControlled = openProp !== undefined;
  const open = isOpenControlled ? openProp : internalOpen;
  const isControlled = selected !== undefined;
  const value = (
    isControlled ? selected : internalSelected
  ) as CalendarSelection[Mode];
  const setOpen = useCallback(
    (next: boolean) => {
      if (next && disabled) {
        return;
      }
      if (!isOpenControlled) {
        setInternalOpen(next);
      }
      onOpenChange?.(next);
    },
    [disabled, isOpenControlled, onOpenChange]
  );
  const handleSelect = useCallback(
    (next: CalendarSelection[Mode]) => {
      if (!isControlled) {
        setInternalSelected(next);
      }
      onSelect?.(next);
      if (mode === "single" && next) {
        setOpen(false);
      }
      if (mode === "range" && (next as DateRange | undefined)?.to) {
        setOpen(false);
      }
    },
    [isControlled, onSelect, mode, setOpen]
  );
  const label = useMemo(() => {
    if (format && value) {
      return format(value);
    }
    return describe(mode, value, locale, system);
  }, [format, value, mode, locale, system]);
  const trigger = children ?? (
    <Button
      variant="outline"
      disabled={disabled}
      className={cn("justify-start gap-[16px]", className)}
    >
      <CalendarIcon size={16} />
      <Text
        className={
          label ? undefined : "text-[color:var(--panel-muted-foreground)]"
        }
      >
        {label ?? placeholder}
      </Text>
    </Button>
  );
  return (
    <Popover open={open} onOpenChange={setOpen} presentation={presentation}>
      <Popover.Trigger>
        {
          trigger as ReactElement<{
            onPress?: () => void;
          }>
        }
      </Popover.Trigger>

      <Popover.Content width="content-fit">
        <View className="flex w-[616px] max-w-full flex-col self-center p-[24px]">
          <Calendar
            bordered={false}
            mode={mode}
            selected={value}
            onSelect={handleSelect}
            disabled={disabledDates}
            minDate={minDate}
            maxDate={maxDate}
            startMonth={startMonth}
            endMonth={endMonth}
            numberOfMonths={numberOfMonths}
            captionLayout={captionLayout}
            weekStartsOn={weekStartsOn}
            selectOutsideDays={selectOutsideDays}
            locale={locale}
            calendar={calendar}
          />
        </View>
      </Popover.Content>
    </Popover>
  );
};
DatePickerRoot.displayName = "DatePicker";
export const DatePicker = Object.assign(DatePickerRoot, {
  Trigger: Popover.Trigger,
});
