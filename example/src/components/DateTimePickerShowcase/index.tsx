import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { DateTimePicker } from "panelui-taro/date-time-picker";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const DateTimePickerShowcase = () => {
  const [value, setValue] = useState(new Date(2026, 9, 13, 9, 30));
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography id="panel-datetime-result">{`${value.getFullYear()}-${value.getMonth() + 1}-${value.getDate()} ${value.getHours()}:${String(value.getMinutes()).padStart(2, "0")}`}</Typography>
      <Typography>Calendar + ruler · inline</Typography>
      <DateTimePicker
        presentation="inline"
        value={value}
        onValueChange={setValue}
        locale="en"
        hourCycle={24}
        timeLabel="Starts"
        minuteStep={15}
      />
      <Typography>Presentations</Typography>
      <DateTimePicker
        value={value}
        onValueChange={setValue}
        locale="en"
        hourCycle={24}
      >
        <Button id="panel-datetime-popover" variant="outline">
          Popover
        </Button>
      </DateTimePicker>
      <DateTimePicker
        presentation="dialog"
        value={value}
        onValueChange={setValue}
        locale="en"
      >
        <Button id="panel-datetime-dialog" variant="outline">
          Dialog
        </Button>
      </DateTimePicker>
      <DateTimePicker
        presentation="bottom-sheet"
        value={value}
        onValueChange={setValue}
        locale="en"
        doneLabel="Finish"
      >
        <Button id="panel-datetime-sheet" variant="outline">
          Sheet
        </Button>
      </DateTimePicker>
    </View>
  );
};
