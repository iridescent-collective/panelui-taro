import { DateTimePicker } from "panelui-taro/date-time-picker";
import { Frame } from "panelui-taro/frame";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function DateTimePickerDemo() {
  const [when, setWhen] = useState<Date>();
  return (
    <View className="w-full gap-4">
      <DateTimePicker value={when} onValueChange={setWhen} />
      <Text size="sm" muted>
        {when
          ? when.toLocaleString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
              hour: "numeric",
              minute: "2-digit",
            })
          : "One value, filled in from either end — the day first or the time first."}
      </Text>
    </View>
  );
}
function DateTimePickerSheetDemo() {
  const [when, setWhen] = useState<Date>();
  return (
    <View className="w-full gap-4">
      <DateTimePicker
        value={when}
        onValueChange={setWhen}
        presentation="bottom-sheet"
        placeholder="Pick a moment in a sheet"
      />
      <Text size="sm" muted>
        A calendar and a scale stacked is a tall panel, and a sheet has the
        height to give it without the popover having to leave the screen.
      </Text>
    </View>
  );
}
function DateTimePickerWheelDemo() {
  const [when, setWhen] = useState<Date>();
  return (
    <View className="w-full gap-4">
      <DateTimePicker
        value={when}
        onValueChange={setWhen}
        layout="wheel"
        hourCycle={24}
        minuteStep={5}
        presentation="dialog"
        placeholder="Pick to the minute"
      />
      <Text size="sm" muted>
        The ruler is the default because it fits under a month grid. Where the
        exact minute matters more than the height, the wheel is a prop away.
      </Text>
    </View>
  );
}
function DateTimePickerSlotDemo() {
  const [when, setWhen] = useState<Date>();
  const today = new Date();
  const window = new Date(today);
  window.setDate(window.getDate() + 21);
  return (
    <View className="w-full gap-3">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Book a fitting</Frame.Title>
          <Frame.Action>30 minutes</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <View className="p-3">
            <DateTimePicker
              presentation="inline"
              value={when}
              onValueChange={setWhen}
              minDate={today}
              maxDate={window}
              minTime={{ hour: 9, minute: 0 }}
              maxTime={{ hour: 17, minute: 30 }}
              minuteStep={30}
            />
          </View>
        </Frame.Panel>
      </Frame>
      <Text size="sm" muted className="text-center">
        {when
          ? when.toLocaleString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "numeric",
              minute: "2-digit",
            })
          : "Next three weeks, 9:00 to 17:30"}
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "date-time-picker",
  name: "DateTimePicker",
  summary: "A day and a time, picked in one panel",
  demos: [
    { label: "Both halves at once", render: () => <DateTimePickerDemo /> },
    { label: "In a sheet", render: () => <DateTimePickerSheetDemo /> },
    { label: "The wheel face", render: () => <DateTimePickerWheelDemo /> },
    { label: "Booking a slot", render: () => <DateTimePickerSlotDemo /> },
  ],
};
