import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Direction } from "panelui-taro/direction";
import { SlideButton } from "panelui-taro/slide-button";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const SlideButtonShowcase = () => {
  const [completed, setCompleted] = useState(false);
  const [count, setCount] = useState(0);
  const [disabled, setDisabled] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">SlideButton · 滑动确认</Typography.Heading>
      <SlideButton
        id="panel-slide-button"
        fullWidth
        completed={completed}
        onCompletedChange={setCompleted}
        disabled={disabled}
        onComplete={() => setCount((current) => current + 1)}
      >
        <SlideButton.Label>Slide to confirm</SlideButton.Label>
      </SlideButton>
      <Typography id="panel-slide-result">{`确认次数：${count} · 完成：${completed}`}</Typography>
      <View className="flex flex-row gap-[16px]">
        <Button
          className="panel-slide-reset"
          variant="outline"
          onPress={() => setCompleted(false)}
        >
          重置
        </Button>
        <Button variant="outline" onPress={() => setDisabled(!disabled)}>
          {disabled ? "启用" : "禁用"}
        </Button>
      </View>
      <SlideButton fullWidth variant="destructive" size="sm">
        Slide to remove
      </SlideButton>
      <SlideButton fullWidth variant="success" size="lg" autoReset>
        Slide to save
      </SlideButton>
      <Direction dir="rtl">
        <SlideButton fullWidth>RTL · Slide to confirm</SlideButton>
      </Direction>
      <SlideButton fullWidth disabled>
        Disabled
      </SlideButton>
    </View>
  );
};
