import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { SplitView } from "panelui-taro/split-view";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { SnapControls } from "./components/SnapControls";

const SNAP_POINTS = [0.25, 0.5, 0.8] as const;
export const SplitViewShowcase = () => {
  const [seam, setSeam] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [index, setIndex] = useState(1);
  const [settled, setSettled] = useState("");
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">SplitView · 吸附布局</Typography.Heading>
      <View className="flex flex-row gap-[16px]">
        <Button variant="outline" onPress={() => setSeam(!seam)}>
          {seam ? "独立面板" : "简洁分隔"}
        </Button>
        <Button variant="outline" onPress={() => setDisabled(!disabled)}>
          {disabled ? "启用吸附" : "冻结分隔"}
        </Button>
      </View>
      <SplitView
        id="panel-splitview"
        className="h-[720px]"
        variant={seam ? "seam" : "panes"}
        snapPoints={SNAP_POINTS}
        minHeight={64}
        maxHeight={-130}
        snapIndex={index}
        onSnapIndexChange={setIndex}
        onSnap={(next, height) => setSettled(`${next} · ${Math.round(height)}`)}
        disabled={disabled}
      >
        <SplitView.Top className="gap-[16px] p-[24px]">
          <Typography.Heading type="h4">内容预览</Typography.Heading>
          <Typography>上方区域</Typography>
        </SplitView.Top>
        <SplitView.DragArea id="panel-splitview-drag">
          <SplitView.Handle />
        </SplitView.DragArea>
        <SplitView.Bottom className="p-[24px]">
          <SnapControls />
        </SplitView.Bottom>
      </SplitView>
      <Typography id="panel-splitview-settled">{`已吸附：${settled}`}</Typography>
    </View>
  );
};
