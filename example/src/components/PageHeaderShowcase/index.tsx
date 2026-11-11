import { View } from "@tarojs/components";
import { Marker } from "panelui-taro/marker";
import { PageHeader } from "panelui-taro/page-header";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const PageHeaderShowcase = () => {
  const [presses, setPresses] = useState(0);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">资料页与会话标记</Typography.Heading>
      <PageHeader>
        <PageHeader.Cover id="panel-profile-cover" />
        <PageHeader.Avatar id="panel-profile-avatar" fallback="LC" verified />
        <PageHeader.Content>
          <PageHeader.Title>澜存同学</PageHeader.Title>
          <PageHeader.Description>每日学习记录</PageHeader.Description>
          <PageHeader.Stats divided>
            <PageHeader.Stat value={24} label="学习天数" />
            <PageHeader.Stat
              value={8}
              label="教材"
              className="panel-profile-stat"
              onPress={() => setPresses((count) => count + 1)}
            />
            <PageHeader.Stat value={12} label="笔记" />
          </PageHeader.Stats>
        </PageHeader.Content>
      </PageHeader>
      <Typography.Paragraph id="panel-profile-result">
        统计点击：{presses}
      </Typography.Paragraph>
      <Marker variant="separator">
        <Marker.Content>今天</Marker.Content>
      </Marker>
      <Marker variant="border">
        <Marker.Content shimmer>正在整理学习记录</Marker.Content>
      </Marker>
      <Marker
        className="panel-marker-click"
        onPress={() => setPresses((count) => count + 1)}
      >
        <Marker.Content>查看学习记录</Marker.Content>
      </Marker>
    </View>
  );
};
