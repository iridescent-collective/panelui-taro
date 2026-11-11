import { View } from "@tarojs/components";
import { Steps } from "panelui-taro/steps";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const StepsShowcase = () => {
  const [value, setValue] = useState(1);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">步骤与状态</Typography.Heading>
      <Steps orientation="vertical" value={value} onValueChange={setValue}>
        <Steps.Item step={0}>
          <Steps.Trigger id="panel-step-first">
            <Steps.Indicator />
            <Steps.Title>选择设备</Steps.Title>
          </Steps.Trigger>
        </Steps.Item>
        <Steps.Item step={1}>
          <Steps.Trigger id="panel-step-second">
            <Steps.Indicator />
            <Steps.Title>完成绑定</Steps.Title>
          </Steps.Trigger>
        </Steps.Item>
        <Steps.Item step={2}>
          <Steps.Trigger id="panel-step-last">
            <Steps.Indicator />
            <Steps.Title>配置课程</Steps.Title>
          </Steps.Trigger>
        </Steps.Item>
      </Steps>
      <Typography.Paragraph id="panel-steps-status">
        当前第 {value + 1} 步
      </Typography.Paragraph>
    </View>
  );
};
