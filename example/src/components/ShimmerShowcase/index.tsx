import { View } from "@tarojs/components";
import { Shimmer } from "panelui-taro/shimmer";
import { Typography } from "panelui-taro/typography";

export const ShimmerShowcase = () => (
  <View className="flex flex-col gap-[24px]">
    <Typography.Heading type="h3">字形扫光</Typography.Heading>
    <Shimmer
      id="panel-shimmer-text"
      duration={4000}
      textClassName="text-[40px] font-semibold"
    >
      正在思考 Thinking…
    </Shimmer>
    <Shimmer reverse mode="ping-pong" textClassName="text-[32px]">
      往返与反向
    </Shimmer>
    <Shimmer enabled={false} textClassName="text-[32px]">
      静止状态
    </Shimmer>
  </View>
);
