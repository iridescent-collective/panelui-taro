import { type DateRange } from "panelui-taro/calendar";
import { DatePicker } from "panelui-taro/date-picker";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function DatePickerDemo() {
  const [day, setDay] = useState<Date>();
  const [range, setRange] = useState<DateRange>();
  const [birthday, setBirthday] = useState<Date>();
  return (
    <View className="w-full gap-6">
      <View className="gap-2">
        <Label>Date</Label>
        <DatePicker selected={day} onSelect={setDay} />
      </View>

      <View className="gap-2">
        <Label>Stay</Label>

        <DatePicker
          mode="range"
          selected={range}
          onSelect={setRange}
          placeholder="Check in — check out"
          minDate={new Date()}
        />
      </View>

      <View className="gap-2">
        <Label>Date of birth</Label>
        <DatePicker
          selected={birthday}
          onSelect={setBirthday}
          captionLayout="dropdown"
          maxDate={new Date()}
          placeholder="Choose a date"
        />
      </View>
    </View>
  );
}
function DatePickerSheetDemo() {
  const [day, setDay] = useState<Date>();
  return (
    <View className="w-full gap-4">
      <DatePicker
        selected={day}
        onSelect={setDay}
        presentation="bottom-sheet"
        placeholder="Pick a date in a sheet"
      />
      <Text size="sm" muted>
        The anchored panel is the default: a month grid is a fixed size and fits
        beside its trigger. A sheet earns its place when the screen is busy.
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "date-picker",
  name: "DatePicker",
  summary: "A calendar behind a button",
  demos: [
    { label: "Single, range and birthday", render: () => <DatePickerDemo /> },
    { label: "In a sheet", render: () => <DatePickerSheetDemo /> },
  ],
};
