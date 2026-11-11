import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Compare } from "panelui-taro/compare";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const CompareShowcase = () => {
  const [value, setValue] = useState(0.5);
  const [vertical, setVertical] = useState(false);
  const [disabled, setDisabled] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">
        Compare · 同尺寸裁剪对比
      </Typography.Heading>
      <View className="flex flex-row gap-[16px]">
        <Button variant="outline" onPress={() => setVertical(!vertical)}>
          {vertical ? "横向对比" : "纵向对比"}
        </Button>
        <Button variant="outline" onPress={() => setDisabled(!disabled)}>
          {disabled ? "允许拖动" : "冻结对比"}
        </Button>
      </View>
      <Compare
        id="panel-compare"
        height={240}
        value={value}
        onValueCommit={setValue}
        orientation={vertical ? "vertical" : "horizontal"}
        disabled={disabled}
      >
        <Compare.Before className="bg-[var(--panel-background)]">
          <View className="flex h-full w-full items-center justify-center bg-[var(--panel-muted)]">
            <View className="flex size-[240px] items-center justify-center rounded-full border-[4px] border-solid border-[var(--panel-foreground)]">
              <Typography.Heading type="h3">原始画面</Typography.Heading>
            </View>
          </View>
        </Compare.Before>
        <Compare.After>
          <View className="flex h-full w-full items-center justify-center bg-[var(--panel-primary)]">
            <View className="flex size-[240px] items-center justify-center rounded-full border-[4px] border-solid border-[var(--panel-primary-foreground)]">
              <Typography className="text-[var(--panel-primary-foreground)]">
                处理后画面
              </Typography>
            </View>
          </View>
        </Compare.After>
        <Compare.Handle id="panel-compare-handle" />
        <Compare.Label>Before</Compare.Label>
        <Compare.Label side="end">After</Compare.Label>
      </Compare>
      <Typography id="panel-compare-result">{`已提交：${Math.round(value * 100)}%`}</Typography>
      <Button
        className="panel-compare-reset"
        variant="outline"
        onPress={() => setValue(0.5)}
      >
        恢复中线
      </Button>
    </View>
  );
};
