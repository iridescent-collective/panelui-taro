import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { useSplitView } from "panelui-taro/split-view";
import { Typography } from "panelui-taro/typography";
import { useSyncExternalStore } from "react";

export const SnapControls = () => {
  const context = useSplitView();
  const height = useSyncExternalStore(
    context.topHeight.subscribe,
    context.topHeight.getSnapshot,
    context.topHeight.getSnapshot
  );
  return (
    <View className="flex flex-col gap-[16px]">
      <Typography.Heading type="h4">学习记录</Typography.Heading>
      <Typography id="panel-splitview-height">{`高度：${Math.round(height)}`}</Typography>
      <View className="flex flex-row gap-[16px]">
        {["收起", "平衡", "展开"].map((label, index) => (
          <Button
            key={label}
            variant="outline"
            size="sm"
            disabled={context.disabled}
            className={`panel-splitview-snap-${index}`}
            onPress={() => context.snapTo(index)}
          >
            {label}
          </Button>
        ))}
      </View>
    </View>
  );
};
