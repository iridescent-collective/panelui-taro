import { View } from "@tarojs/components";
import { Calendar } from "panelui-taro/calendar";
import type { DateRange } from "panelui-taro/calendar";
import { DatePicker } from "panelui-taro/date-picker";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const MONTH = new Date(2026, 9, 1);
const formatDay = (date?: Date) =>
  date ? `${date.getMonth() + 1}/${date.getDate()}` : "—";
export const CalendarShowcase = () => {
  const [range, setRange] = useState<DateRange>();
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">日期与范围</Typography.Heading>
      <Calendar
        id="panel-calendar"
        mode="range"
        defaultMonth={MONTH}
        captionLayout="dropdown"
        locale="zh-CN"
        weekStartsOn={1}
        onSelect={setRange}
      />
      <Typography.Paragraph id="panel-calendar-status">
        {formatDay(range?.from)} 至 {formatDay(range?.to)}
      </Typography.Paragraph>
      <DatePicker
        locale="zh-CN"
        defaultSelected={MONTH}
        captionLayout="dropdown"
        placeholder="选择日期"
      />
    </View>
  );
};
