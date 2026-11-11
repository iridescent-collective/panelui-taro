import { ScrollView, View } from "@tarojs/components";
import { ScrollFade } from "panelui-taro/scroll-fade";
import { Typography } from "panelui-taro/typography";

export const ScrollFadeShowcase = () => (
  <View className="flex flex-col gap-[24px]">
    <Typography.Heading type="h3">滚动边缘渐隐</Typography.Heading>
    <ScrollFade size={32}>
      <ScrollView id="panel-fade-vertical" scrollY style={{ height: "280rpx" }}>
        {Array.from({ length: 8 }, (_, index) => (
          <View
            key={`chapter-${index}`}
            className="border-b-[2px] border-solid border-[var(--panel-border)] p-[24px]"
          >
            <Typography>第 {index + 1} 章 · 学习记录</Typography>
          </View>
        ))}
      </ScrollView>
    </ScrollFade>
    <ScrollFade size={24}>
      <ScrollView
        id="panel-fade-horizontal"
        scrollX
        className="whitespace-nowrap"
        style={{ height: "120rpx" }}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <View
            key={`subject-${index}`}
            className="me-[16px] inline-block rounded-[var(--panel-radius-lg)] bg-[var(--panel-muted)] p-[32px]"
          >
            <Typography>科目 {index + 1}</Typography>
          </View>
        ))}
      </ScrollView>
    </ScrollFade>
  </View>
);
