import { View } from "@tarojs/components";
import { Badge } from "panelui-taro/badge";
import { Marquee } from "panelui-taro/marquee";
import { Typography } from "panelui-taro/typography";

const Subjects = () => (
  <View className="flex flex-row gap-[24px]">
    <Badge>数学</Badge>
    <Badge>语文</Badge>
    <Badge>英语</Badge>
    <Badge>科学</Badge>
  </View>
);
export const MarqueeShowcase = () => (
  <View className="flex flex-col gap-[24px]">
    <Typography.Heading type="h3">Marquee · 连续内容</Typography.Heading>
    <Marquee.Group pauseLabel="暂停全部" playLabel="继续播放">
      <Marquee spacing={24} speed={32} style={{ height: "72rpx" }}>
        <Subjects />
      </Marquee>
      <Marquee reverse spacing={24} speed={24} style={{ height: "72rpx" }}>
        <Subjects />
      </Marquee>
    </Marquee.Group>
    <Typography.Heading type="h4">纵向内容</Typography.Heading>
    <Marquee
      direction="vertical"
      spacing={20}
      style={{ height: "360rpx" }}
      pauseLabel="暂停纵向"
      playLabel="继续纵向"
    >
      <View className="flex flex-col gap-[24px]">
        <Typography>每日练习</Typography>
        <Typography>复习计划</Typography>
        <Typography>学习反馈</Typography>
      </View>
    </Marquee>
  </View>
);
