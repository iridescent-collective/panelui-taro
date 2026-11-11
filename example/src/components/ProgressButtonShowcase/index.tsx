import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { ProgressButton } from "panelui-taro/progress-button";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const ProgressButtonShowcase = () => {
  const [completed, setCompleted] = useState(false);
  const [count, setCount] = useState(0);
  const [disabled, setDisabled] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">
        ProgressButton · 持续按住确认
      </Typography.Heading>
      <ProgressButton
        id="panel-progress-button"
        fullWidth
        holdDuration={1000}
        completed={completed}
        onCompletedChange={setCompleted}
        onComplete={() => setCount((current) => current + 1)}
        disabled={disabled}
      >
        <ProgressButton.Label>长按确认（1秒）</ProgressButton.Label>
      </ProgressButton>
      <Typography id="panel-progress-result">{`确认次数：${count} · 完成：${completed}`}</Typography>
      <View className="flex flex-row gap-[16px]">
        <Button
          className="panel-progress-reset"
          variant="outline"
          onPress={() => setCompleted(false)}
        >
          重置完成状态
        </Button>
        <Button variant="outline" onPress={() => setDisabled(!disabled)}>
          {disabled ? "允许长按" : "禁用确认"}
        </Button>
      </View>
      <ProgressButton variant="secondary" shape="rounded" fullWidth>
        <ProgressButton.Label>默认两秒 · Rounded</ProgressButton.Label>
      </ProgressButton>
      <ProgressButton variant="destructive" size="sm" autoReset fullWidth>
        <ProgressButton.Label>Destructive · 自动重置</ProgressButton.Label>
        <ProgressButton.Done>
          <Typography className="text-[var(--panel-destructive-solid-foreground)]">
            Done
          </Typography>
        </ProgressButton.Done>
      </ProgressButton>
      <ProgressButton variant="success" size="lg" fullWidth>
        <ProgressButton.Label>Success · Large</ProgressButton.Label>
      </ProgressButton>
      <ProgressButton disabled fullWidth>
        <ProgressButton.Label>Disabled</ProgressButton.Label>
      </ProgressButton>
    </View>
  );
};
