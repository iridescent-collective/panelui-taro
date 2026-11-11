import { View } from "@tarojs/components";
import { MessageCircleIcon, FileIcon } from "panelui-taro/icons";
import { Support } from "panelui-taro/support";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const SupportShowcase = () => {
  const [topic, setTopic] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Support availability="online">
        <Support.Header title="帮助与支持" description="Support 组件验收" />
        <Support.Status replyTime="客服在线" />
        <Support.Channels title="联系方式">
          <Support.Channel
            className="panel-support-channel"
            icon={<MessageCircleIcon size={18} />}
            label="发送消息"
            description="设备或学习问题"
            onPress={() => setReply("消息")}
          />
        </Support.Channels>
        <Support.Topics title="问题分类" value={topic} onValueChange={setTopic}>
          <Support.Topic
            className="panel-support-device"
            value="device"
            icon={<FileIcon size={18} />}
            label="设备"
            description="连接与绑定"
          />
          <Support.Topic value="study" label="学习" />
          <Support.Topic value="disabled" label="暂未开放" disabled />
        </Support.Topics>
        <Support.Conversations title="最近反馈">
          <Support.Conversation
            title="设备连接"
            status="pending"
            timestamp="2h"
            unread
            preview="等待补充信息"
            onPress={() => setReply("会话")}
          />
        </Support.Conversations>
        <Support.Agent name="客服" role="设备支持" />
        <Support.Ticket reference="TEST-001" subject="设备连接" status="open" />
        <Support.Handoff>已转交设备支持</Support.Handoff>
        <Support.Note>这是组件验收示例</Support.Note>
        <Support.Replies>
          <Support.Reply
            className="panel-support-reply"
            label="已解决"
            value="resolved"
            onPress={setReply}
          />
        </Support.Replies>
        <Support.Resolution title="是否解决了问题？" />
      </Support>
      <Typography.Paragraph id="panel-support-result">
        分类：{topic ?? "无"}；回复：{reply || "无"}
      </Typography.Paragraph>
    </View>
  );
};
