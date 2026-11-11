import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Plan } from "panelui-taro/plan";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const PlanShowcase = () => {
  const [streaming, setStreaming] = useState(true);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">学习计划</Typography.Heading>
      <Plan isStreaming={streaming}>
        <Plan.Header>
          <Plan.Title>整理本周数学复习</Plan.Title>
          <Plan.Description>根据教材章节生成练习安排</Plan.Description>
          <Plan.Action>
            <Plan.Progress />
            <Plan.Trigger className="panel-plan-toggle" />
          </Plan.Action>
        </Plan.Header>
        <Plan.Content id="panel-plan-content">
          <Plan.Steps>
            <Plan.Step status="done" meta="数学.pdf">
              读取教材章节
            </Plan.Step>
            <Plan.Step status="skipped">跳过已掌握的知识点</Plan.Step>
            <Plan.Step
              status={streaming ? "active" : "done"}
              description="梳理重点与薄弱项"
            >
              安排练习内容
            </Plan.Step>
            <Plan.Step>确认复习计划</Plan.Step>
          </Plan.Steps>
        </Plan.Content>
        <Plan.Footer>
          <Button variant="outline" onPress={() => setStreaming(true)}>
            重新整理
          </Button>
          <Button
            className="panel-plan-complete"
            onPress={() => setStreaming(false)}
          >
            确认
          </Button>
        </Plan.Footer>
      </Plan>
    </View>
  );
};
