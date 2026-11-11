import { ScrollView, View } from "@tarojs/components";
import { ScrollBlur } from "panelui-taro/scroll-blur";
import { Typography } from "panelui-taro/typography";

export const ScrollBlurShowcase = () => (
  <View className="flex flex-col gap-[24px]">
    <Typography.Heading type="h3">滚动材质边缘</Typography.Heading>
    <ScrollBlur>
      <ScrollView id="panel-blur-scroll" scrollY style={{ height: "280rpx" }}>
        {Array.from({ length: 8 }, (_, index) => (
          <View
            key={`blur-chapter-${index}`}
            className="border-b-[2px] border-solid border-[var(--panel-border)] p-[24px]"
          >
            <Typography>章节 {index + 1} · 学习与练习</Typography>
          </View>
        ))}
      </ScrollView>
    </ScrollBlur>
  </View>
);
