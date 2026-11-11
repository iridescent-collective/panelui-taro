import { Calendar, type DateRange } from "panelui-taro/calendar";
import { Text } from "panelui-taro/primitives/text";
import { Switch } from "panelui-taro/switch";
import { Tabs } from "panelui-taro/tabs";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const addDemoDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};
function CalendarSingleDemo() {
  const [day, setDay] = useState<Date | undefined>(new Date());
  return (
    <View className="w-full gap-4">
      <Calendar selected={day} onSelect={setDay} />
      <Text size="sm" muted className="text-center">
        {day
          ? day.toDateString()
          : "Nothing picked — tap the same day again to clear it."}
      </Text>
    </View>
  );
}
function CalendarRangeDemo() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDemoDays(9),
  });
  return (
    <View className="w-full gap-4">
      <Calendar mode="range" selected={range} onSelect={setRange} />
      <Text size="sm" muted className="text-center">
        {range?.to
          ? `${range.from.toDateString()} → ${range.to.toDateString()}`
          : "Pick the other end."}
      </Text>
    </View>
  );
}
function CalendarMultipleDemo() {
  const [days, setDays] = useState<Date[]>([
    new Date(),
    addDemoDays(3),
    addDemoDays(4),
  ]);
  return (
    <View className="w-full gap-4">
      <Calendar mode="multiple" selected={days} onSelect={setDays} />
      <Text size="sm" muted className="text-center">
        {days.length} {days.length === 1 ? "date" : "dates"} picked
      </Text>
    </View>
  );
}
function CalendarDisabledDemo() {
  const [day, setDay] = useState<Date>();
  return (
    <View className="w-full gap-4">
      <Calendar
        selected={day}
        onSelect={setDay}
        minDate={new Date()}
        maxDate={addDemoDays(60)}
        disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
      />
      <Text size="sm" muted className="text-center">
        Weekdays only, and nothing before today or more than two months out.
      </Text>
    </View>
  );
}
function CalendarDropdownDemo() {
  const [day, setDay] = useState<Date>();
  return (
    <View className="w-full gap-4">
      <Calendar
        selected={day}
        onSelect={setDay}
        captionLayout="dropdown"
        maxDate={new Date()}
        startMonth={new Date(1925, 0, 1)}
        endMonth={new Date()}
        defaultMonth={new Date(1996, 5, 1)}
      />
      <Text size="sm" muted className="text-center">
        Tap the month or the year to jump rather than paging.
      </Text>
    </View>
  );
}
function CalendarOutsideDaysDemo() {
  const [day, setDay] = useState<Date | undefined>(new Date());
  const [reachable, setReachable] = useState(false);
  return (
    <View className="w-full gap-4">
      <Calendar
        selected={day}
        onSelect={setDay}
        selectOutsideDays={reachable}
      />
      <View className="flex-row items-center justify-between gap-3">
        <Text size="sm" muted className="flex-1">
          {reachable
            ? "The greyed days at either end answer a tap."
            : "The greyed days at either end ignore a tap. Page to the month instead."}
        </Text>
        <Switch value={reachable} onValueChange={setReachable} />
      </View>
    </View>
  );
}
function CalendarSystemDemo() {
  const [system, setSystem] = useState<"gregory" | "islamic">("gregory");
  const [day, setDay] = useState<Date>();
  return (
    <View className="w-full gap-4">
      <Tabs
        defaultValue="gregory"
        value={system}
        onValueChange={(next) => setSystem(next as typeof system)}
      >
        <Tabs.List>
          <Tabs.Trigger value="gregory">Gregorian</Tabs.Trigger>
          <Tabs.Trigger value="islamic">Hijri</Tabs.Trigger>
        </Tabs.List>
      </Tabs>

      <Calendar selected={day} onSelect={setDay} calendar={system} />

      <Text size="sm" muted className="text-center">
        {day
          ? day.toDateString()
          : "The value is a plain Date whichever is on screen."}
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "calendar",
  name: "Calendar",
  summary: "A month of days, for picking one, several, or a range",
  demos: [
    { label: "A single day", render: () => <CalendarSingleDemo /> },
    { label: "A range", render: () => <CalendarRangeDemo /> },
    { label: "Several days", render: () => <CalendarMultipleDemo /> },
    { label: "Days ruled out", render: () => <CalendarDisabledDemo /> },
    {
      label: "The months either side",
      render: () => <CalendarOutsideDaysDemo />,
    },
    { label: "Month and year pickers", render: () => <CalendarDropdownDemo /> },
    { label: "Hijri or Gregorian", render: () => <CalendarSystemDemo /> },
  ],
};
