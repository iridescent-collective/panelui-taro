import { View } from "@tarojs/components";
import { FlipCard } from "panelui-taro/flip-card";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const FlipCardShowcase = () => {
  const [flipped, setFlipped] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">双面卡片</Typography.Heading>
      <FlipCard
        id="panel-flip-press"
        className="h-[280px] w-full"
        onFlippedChange={setFlipped}
      >
        <FlipCard.Front className="flex items-center justify-center rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] p-[48px]">
          <Typography>轻触查看答案</Typography>
        </FlipCard.Front>
        <FlipCard.Back className="flex items-center justify-center rounded-[var(--panel-radius-2xl)] bg-[var(--panel-primary)] p-[48px]">
          <Typography className="text-[color:var(--panel-primary-foreground)]">
            答案：先理解，再练习
          </Typography>
        </FlipCard.Back>
      </FlipCard>
      <Typography id="panel-flip-state">
        当前：{flipped ? "背面" : "正面"}
      </Typography>
      <FlipCard
        id="panel-flip-drag"
        trigger="drag"
        direction="vertical"
        className="h-[200px] w-full"
      >
        <FlipCard.Front className="flex items-center justify-center rounded-[var(--panel-radius-xl)] bg-[var(--panel-muted)]">
          <Typography>向下拖动</Typography>
        </FlipCard.Front>
        <FlipCard.Back className="flex items-center justify-center rounded-[var(--panel-radius-xl)] bg-[var(--panel-secondary)]">
          <Typography>拖动背面</Typography>
        </FlipCard.Back>
      </FlipCard>
    </View>
  );
};
