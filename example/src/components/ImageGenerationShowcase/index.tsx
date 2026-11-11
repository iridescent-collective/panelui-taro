import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { ImageGeneration } from "panelui-taro/image-generation";
import type { ImageGenerationStatus } from "panelui-taro/image-generation";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const ImageGenerationShowcase = () => {
  const [status, setStatus] = useState<ImageGenerationStatus>("generating");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">图像生成</Typography.Heading>
      <ImageGeneration
        status={status}
        size="fluid"
        aspectRatio={1.8}
        prompt="教材章节示意图"
        onRetry={() => setStatus("generating")}
      >
        <View
          className="h-full w-full"
          style={{ background: "linear-gradient(135deg, #ede9df, #b4a58c)" }}
        />
      </ImageGeneration>
      <View className="flex flex-row gap-[16px]">
        <Button
          variant="outline"
          className="panel-generation-refine"
          onPress={() => setStatus("refining")}
        >
          细化
        </Button>
        <Button
          className="panel-generation-complete"
          onPress={() => setStatus("complete")}
        >
          完成
        </Button>
        <Button
          variant="outline"
          className="panel-generation-error"
          onPress={() => setStatus("error")}
        >
          失败
        </Button>
      </View>
      <View className="relative h-[160px] overflow-hidden rounded-[var(--panel-radius-lg)] bg-[var(--panel-muted)]">
        <ImageGeneration.Field animation="scan" />
      </View>
      <View className="relative h-[160px] overflow-hidden rounded-[var(--panel-radius-lg)] bg-[var(--panel-muted)]">
        <ImageGeneration.Field animation="pulse" paused />
      </View>
    </View>
  );
};
