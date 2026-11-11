import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Splitter } from "panelui-taro/splitter";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const SplitterShowcase = () => {
  const [layout, setLayout] = useState([65, 35]);
  const [vertical, setVertical] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">Splitter · 分栏布局</Typography.Heading>
      <View className="flex flex-row gap-[16px]">
        <Button variant="outline" onPress={() => setVertical(!vertical)}>
          {vertical ? "横向布局" : "纵向布局"}
        </Button>
        <Button variant="outline" onPress={() => setDisabled(!disabled)}>
          {disabled ? "启用拖动" : "冻结布局"}
        </Button>
      </View>
      <Splitter
        id="panel-splitter"
        className="h-[480px] rounded-2xl border-[2px] border-solid border-[var(--panel-border)]"
        orientation={vertical ? "vertical" : "horizontal"}
        layout={layout}
        onLayoutChange={setLayout}
        disabled={disabled}
      >
        <Splitter.Panel
          className="gap-[16px] bg-[var(--panel-surface)] p-[24px]"
          minSize={20}
        >
          <Typography.Heading type="h4">阅读内容</Typography.Heading>
          <Typography>第一面板</Typography>
        </Splitter.Panel>
        <Splitter.Handle id="panel-split-handle" />
        <Splitter.Panel
          className="gap-[16px] bg-[var(--panel-card)] p-[24px]"
          minSize={20}
          collapsible
        >
          <Typography.Heading type="h4">学习记录</Typography.Heading>
          <Typography>第二面板</Typography>
        </Splitter.Panel>
      </Splitter>
      <Typography id="panel-splitter-result">
        {layout.map((value) => `${Math.round(value)}%`).join(" / ")}
      </Typography>
      <Button
        variant="outline"
        className="panel-splitter-reset"
        onPress={() => setLayout([65, 35])}
      >
        恢复默认布局
      </Button>
    </View>
  );
};
