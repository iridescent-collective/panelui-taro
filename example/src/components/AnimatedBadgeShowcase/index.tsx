import { View } from "@tarojs/components";
import { AnimatedBadge } from "panelui-taro/animated-badge";
import type { AnimatedBadgeStatus } from "panelui-taro/animated-badge";
import { Button } from "panelui-taro/button";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const AnimatedBadgeShowcase = () => {
  const [status, setStatus] = useState<AnimatedBadgeStatus>("loading");
  const label = status === "loading" ? "正在同步教材" : "同步完成";
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">动态状态标签</Typography.Heading>
      <AnimatedBadge id="panel-animated-badge" status={status}>
        {label}
      </AnimatedBadge>
      <View className="flex flex-row gap-[16px]">
        <Button
          className="panel-badge-ready"
          onPress={() => setStatus("success")}
        >
          完成
        </Button>
        <Button
          variant="outline"
          className="panel-badge-loading"
          onPress={() => setStatus("loading")}
        >
          重新同步
        </Button>
      </View>
      <View className="flex flex-row flex-wrap gap-[16px]">
        <AnimatedBadge size="sm" status="neutral">
          待机
        </AnimatedBadge>
        <AnimatedBadge size="sm" status="info">
          提示
        </AnimatedBadge>
        <AnimatedBadge size="sm" status="warning">
          注意
        </AnimatedBadge>
        <AnimatedBadge size="sm" status="danger">
          失败
        </AnimatedBadge>
        <AnimatedBadge size="sm" status="success">
          完成
        </AnimatedBadge>
      </View>
    </View>
  );
};
