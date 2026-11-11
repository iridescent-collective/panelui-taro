import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Feedback } from "panelui-taro/feedback";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const FeedbackShowcase = () => {
  const [submitted, setSubmitted] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">意见反馈</Typography.Heading>
      <Feedback>
        <Feedback.Trigger>
          <Button className="panel-feedback-open">打开反馈</Button>
        </Feedback.Trigger>
        <Feedback.Content>
          <Feedback.Panel>
            <Feedback.Title>想优先改进什么？</Feedback.Title>
            <Feedback.Close label="关闭反馈" />
            <Feedback.Field
              id="panel-feedback-input"
              accessibilityLabel="反馈内容"
              placeholder="仅组件验收，不发送真实反馈"
            />
          </Feedback.Panel>
          <Feedback.Footer>
            <Feedback.Cancel>取消</Feedback.Cancel>
            <Feedback.Submit
              className="panel-feedback-submit"
              onSubmit={setSubmitted}
            >
              提交
            </Feedback.Submit>
          </Feedback.Footer>
        </Feedback.Content>
      </Feedback>
      <Typography.Paragraph id="panel-feedback-result">
        提交：{submitted || "无"}
      </Typography.Paragraph>
    </View>
  );
};
