import { View } from "@tarojs/components";
import { Direction } from "panelui-taro/direction";
import { Slider } from "panelui-taro/slider";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const SliderShowcase = () => {
  const [value, setValue] = useState(30);
  const [range, setRange] = useState<[number, number]>([20, 80]);
  const [commits, setCommits] = useState(0);
  return (
    <View className="flex flex-col gap-[40px]">
      <Typography.Heading type="h3">Slider · 数值与区间</Typography.Heading>
      <Slider
        label="Volume"
        showValue
        value={value}
        onValueChange={setValue}
        onValueCommit={() => setCommits((count) => count + 1)}
        trackClassName="panel-slider-volume"
      />
      <Typography id="panel-slider-result">{`当前：${value} · 确认：${commits}`}</Typography>
      <Slider
        label="Price"
        showValue
        range={range}
        onRangeChange={setRange}
        step={10}
        minStepsBetweenThumbs={2}
        formatValue={(amount) => `$${amount}`}
        color="success"
        size="lg"
        trackClassName="panel-slider-range"
      />
      <Slider
        label="Small warning"
        showValue
        defaultValue={45}
        color="warning"
        size="sm"
      />
      <Slider
        label="Destructive"
        showValue
        defaultValue={65}
        color="destructive"
      />
      <Slider label="Info" showValue defaultValue={70} color="info" />
      <Slider label="Disabled" showValue disabled defaultValue={50} />
      <Direction dir="rtl">
        <Slider label="RTL" showValue defaultValue={20} />
      </Direction>
      <Slider label="WeChat native" showValue native defaultValue={30} />
    </View>
  );
};
