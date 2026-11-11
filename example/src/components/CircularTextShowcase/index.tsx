import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { CircularText } from "panelui-taro/circular-text";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const CircularTextShowcase = () => {
  const [paused, setPaused] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">圆周文字</Typography.Heading>
      <CircularText
        id="panel-circular-text"
        className="self-center"
        radius={64}
        paused={paused}
        textClassName="text-[24px] font-medium"
      >
        {"PANEL UI · 学习与成长 · "}
      </CircularText>
      <Button
        variant="outline"
        className="panel-circular-pause"
        onPress={() => setPaused((value) => !value)}
      >
        {paused ? "继续旋转" : "暂停旋转"}
      </Button>
    </View>
  );
};
