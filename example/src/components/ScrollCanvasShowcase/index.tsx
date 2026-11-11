import { ScrollView, View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { createObservableNumber } from "panelui-taro/primitives/observable-number";
import { ScrollProgress } from "panelui-taro/primitives/scroll-progress";
import { ScrollCanvas } from "panelui-taro/scroll-canvas";
import { ScrollText } from "panelui-taro/scroll-text";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const FRAME_ONE = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="400" height="250" fill="#f5f5f5"/><path d="M0 125h400M200 0v250" stroke="#737373"/><circle cx="200" cy="125" r="60" fill="#262626"/></svg>')}`;
const FRAME_TWO = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250"><rect width="400" height="250" fill="#262626"/><rect x="140" y="65" width="120" height="120" fill="#fafafa"/></svg>')}`;
export const ScrollCanvasShowcase = () => {
  const [progress] = useState(() => createObservableNumber());
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">滚动图像</Typography.Heading>
      <View className="flex gap-[16px]">
        <Button
          size="sm"
          className="panel-scrub-start"
          onPress={() => {
            progress.value = 0;
          }}
        >
          开始
        </Button>
        <Button
          size="sm"
          className="panel-scrub-middle"
          onPress={() => {
            progress.value = 0.5;
          }}
        >
          中间
        </Button>
        <Button
          size="sm"
          className="panel-scrub-end"
          onPress={() => {
            progress.value = 1;
          }}
        >
          结束
        </Button>
      </View>
      <ScrollText
        progress={progress}
        effect="highlight"
        size="xl"
        weight="semibold"
        by="character"
      >
        滚动让文字逐步显现
      </ScrollText>
      <ScrollText progress={progress} effect="rise" size="xl">
        Words rise as you scroll
      </ScrollText>
      <ScrollProgress>
        <ScrollView
          id="panel-flex-scroll"
          enableFlex
          style={{ display: "flex", flexDirection: "column", height: "400rpx" }}
        >
          <View id="panel-flex-first" className="flex-1">
            第一半
          </View>
          <View id="panel-flex-second" className="flex-1">
            第二半
          </View>
        </ScrollView>
      </ScrollProgress>
      <ScrollProgress>
        <ScrollView
          id="panel-reveal-scroll"
          scrollY
          style={{ height: "400rpx" }}
        >
          <View className="h-[240px]" />
          <ScrollText by="character" effect="fade" size="xl">
            跟随实际滚动变化
          </ScrollText>
          <ScrollCanvas source={FRAME_ONE} effect="zoom" />
          <View className="h-[240px]" />
        </ScrollView>
      </ScrollProgress>
      <ScrollCanvas
        id="panel-scrub-reveal"
        source={FRAME_ONE}
        effect="reveal"
        progress={progress}
      />
      <ScrollCanvas
        sources={[FRAME_ONE, FRAME_TWO]}
        effect="sequence"
        progress={progress}
      />
      <ScrollCanvas source={FRAME_ONE} effect="parallax" progress={progress} />
      <ScrollCanvas source={FRAME_ONE} effect="zoom" progress={progress} />
    </View>
  );
};
