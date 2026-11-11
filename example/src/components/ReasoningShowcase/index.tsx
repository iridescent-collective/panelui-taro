import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Reasoning } from "panelui-taro/reasoning";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const ReasoningShowcase = () => {
  const [streaming, setStreaming] = useState(true);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">思考过程</Typography.Heading>
      <View className="flex gap-[16px]">
        <Button size="sm" onPress={() => setStreaming(true)}>
          开始
        </Button>
        <Button
          size="sm"
          className="panel-reasoning-finish"
          onPress={() => setStreaming(false)}
        >
          结束
        </Button>
      </View>
      <Reasoning isStreaming={streaming}>
        <Reasoning.Trigger
          className="panel-reasoning-toggle"
          label={(active, duration) =>
            active ? "正在思考…" : `思考了 ${duration ?? 0} 秒`
          }
        />
        <Reasoning.Content id="panel-reasoning-content">
          先确认条件，再逐步整理结果。这是组件验收内容。
        </Reasoning.Content>
      </Reasoning>
      <Reasoning duration={8}>
        <Reasoning.Trigger />
        <Reasoning.Content>已经结束的内容默认折叠。</Reasoning.Content>
      </Reasoning>
    </View>
  );
};
