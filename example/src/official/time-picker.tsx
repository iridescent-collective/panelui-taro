import { Frame } from "panelui-taro/frame";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import {
  TimePicker,
  type TimeValue,
} from "panelui-taro/time-picker";
import { useToast } from "panelui-taro/toast";
import { formatTime } from "panelui-taro/utils/time";
import { useState } from "react";

import { Pressable, View } from "../runtime/native";
import { ComponentEntry } from "../types";
function TimePickerPresentationsDemo() {
  const [popover, setPopover] = useState<TimeValue>();
  const [dialog, setDialog] = useState<TimeValue>();
  const [sheet, setSheet] = useState<TimeValue>();
  return (
    <View className="w-full gap-6">
      <View className="gap-2">
        <Label>Popover</Label>
        <TimePicker value={popover} onValueChange={setPopover} />
      </View>

      <View className="gap-2">
        <Label>Dialog</Label>
        <TimePicker
          presentation="dialog"
          value={dialog}
          onValueChange={setDialog}
        />
      </View>

      <View className="gap-2">
        <Label>Bottom sheet</Label>
        <TimePicker
          presentation="bottom-sheet"
          value={sheet}
          onValueChange={setSheet}
        />
      </View>
    </View>
  );
}
function TimePickerWheelDemo() {
  const [any, setAny] = useState<TimeValue>();
  const [slot, setSlot] = useState<TimeValue>();
  return (
    <View className="w-full gap-6">
      <View className="gap-2">
        <Label>A 24-hour clock</Label>
        <TimePicker hourCycle={24} value={any} onValueChange={setAny} />
      </View>

      <View className="gap-2">
        <Label>Within opening hours</Label>

        <TimePicker
          value={slot}
          onValueChange={setSlot}
          minTime={{ hour: 9, minute: 0 }}
          maxTime={{ hour: 17, minute: 30 }}
          minuteStep={15}
          placeholder="Pick a slot"
        />
      </View>
    </View>
  );
}
function TimePickerClockDemo() {
  const [time, setTime] = useState<TimeValue>({ hour: 19, minute: 0 });
  return (
    <View className="w-full items-center gap-4">
      <TimePicker
        presentation="inline"
        layout="clock"
        value={time}
        onValueChange={setTime}
      />
      <Text size="sm" muted>
        The hands sweep rather than jump. The face is there to say when in the
        day the highlighted row is, and a hand that jumps gives that away one
        row at a time.
      </Text>
    </View>
  );
}
function TimePickerRulerDemo() {
  const [time, setTime] = useState<TimeValue>({ hour: 0, minute: 0 });
  return (
    <View className="w-full gap-6">
      <View className="gap-2">
        <Text size="2xl" weight="semibold">
          Reminder
        </Text>
        <Text muted>
          The readout reads at arm's length, which is what makes this the layout
          for a sheet. Swipe the scale; it comes to rest on a step.
        </Text>
      </View>

      <TimePicker
        layout="ruler"
        presentation="bottom-sheet"
        value={time}
        onValueChange={setTime}
        placeholder="Set a reminder"
      />

      <Text size="sm" muted>
        Chosen: {formatTime(time)}
      </Text>
    </View>
  );
}
type TimeEdge = "start" | "end";
function TimeEdgeButton({
  label,
  time,
  active,
  onPress,
}: {
  label: string;
  time: TimeValue;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${formatTime(time)}`}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className={`rounded-md px-2 py-1 ${active ? "bg-accent" : ""}`}
    >
      <Text size="sm" weight={active ? "medium" : "normal"} muted={!active}>
        {formatTime(time)}
      </Text>
    </Pressable>
  );
}
function TimePickerReadoutDemo() {
  const [time, setTime] = useState<TimeValue>({ hour: 14, minute: 30 });
  return (
    <View className="w-full gap-6">
      {(["default", "compact", "none"] as const).map((readout) => (
        <View key={readout} className="w-full gap-2">
          <Text size="xs" muted>
            readout=&quot;{readout}&quot;
          </Text>
          <TimePicker
            presentation="inline"
            layout="ruler"
            readout={readout}
            value={time}
            onValueChange={setTime}
          />
        </View>
      ))}
    </View>
  );
}
function TimePickerFrameDemo() {
  const { toast } = useToast();
  const [edge, setEdge] = useState<TimeEdge>("start");
  const [start, setStart] = useState<TimeValue>({ hour: 19, minute: 0 });
  const [end, setEnd] = useState<TimeValue>({ hour: 21, minute: 30 });
  const editing = edge === "start" ? start : end;
  const setEditing = edge === "start" ? setStart : setEnd;
  const edit = (next: TimeEdge) => {
    setEdge(next);
    toast.show({
      variant: "info",
      label: next === "start" ? "Editing the start" : "Editing the end",
      description: "Turn the face to set it.",
      duration: 2000,
    });
  };
  return (
    <View className="w-full gap-3">
      <Frame className="w-full">
        <Frame.Header>
          <Frame.Title>Time</Frame.Title>
          <Frame.Action className="gap-1">
            <TimeEdgeButton
              label="Starts"
              time={start}
              active={edge === "start"}
              onPress={() => edit("start")}
            />
            <Text size="sm" muted>
              –
            </Text>
            <TimeEdgeButton
              label="Ends"
              time={end}
              active={edge === "end"}
              onPress={() => edit("end")}
            />
          </Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Frame.Section className="items-center">
            <TimePicker
              presentation="inline"
              layout="clock"
              value={editing}
              onValueChange={setEditing}
            />
          </Frame.Section>
        </Frame.Panel>
      </Frame>

      <Text size="sm" muted>
        Tap either time to point the face at it.
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "time-picker",
  name: "TimePicker",
  summary: "A time of day, as a wheel, a clock or a swipeable scale",
  demos: [
    { label: "The ruler, in a sheet", render: () => <TimePickerRulerDemo /> },
    { label: "Presentations", render: () => <TimePickerPresentationsDemo /> },
    { label: "The wheel", render: () => <TimePickerWheelDemo /> },
    { label: "The clock face", render: () => <TimePickerClockDemo /> },
    {
      label: "How loud the readout is",
      render: () => <TimePickerReadoutDemo />,
    },
    { label: "Inline, inside a Frame", render: () => <TimePickerFrameDemo /> },
  ],
};
