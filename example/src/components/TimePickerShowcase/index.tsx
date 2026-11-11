import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { TimePicker } from "panelui-taro/time-picker";
import type { TimeValue } from "panelui-taro/time-picker";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const TimePickerShowcase = () => {
  const [value, setValue] = useState<TimeValue>({ hour: 9, minute: 30 });
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography id="panel-time-result">{JSON.stringify(value)}</Typography>
      <Typography>Wheel · 24-hour · 15-minute step</Typography>
      <TimePicker
        presentation="inline"
        value={value}
        onValueChange={setValue}
        hourCycle={24}
        minuteStep={15}
      />
      <Typography>Clock · bounded 08:00–18:00</Typography>
      <TimePicker
        presentation="inline"
        layout="clock"
        value={value}
        onValueChange={setValue}
        minTime={{ hour: 8, minute: 0 }}
        maxTime={{ hour: 18, minute: 0 }}
        hourCycle={24}
      />
      <Typography>Ruler · compact readout</Typography>
      <TimePicker
        presentation="inline"
        layout="ruler"
        value={value}
        onValueChange={setValue}
        readout="compact"
        hourCycle={24}
      />
      <Typography>Presentations</Typography>
      <TimePicker value={value} onValueChange={setValue} hourCycle={24}>
        <Button id="panel-time-popover" variant="outline">
          Popover
        </Button>
      </TimePicker>
      <TimePicker presentation="dialog" value={value} onValueChange={setValue}>
        <Button id="panel-time-dialog" variant="outline">
          Dialog · 12-hour wheel
        </Button>
      </TimePicker>
      <TimePicker
        presentation="bottom-sheet"
        layout="ruler"
        value={value}
        onValueChange={setValue}
      >
        <Button id="panel-time-sheet" variant="outline">
          Sheet · ruler
        </Button>
      </TimePicker>
    </View>
  );
};
