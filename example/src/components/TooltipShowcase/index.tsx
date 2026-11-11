import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Tooltip } from "panelui-taro/tooltip";
import { Typography } from "panelui-taro/typography";

export const TooltipShowcase = () => (
  <View className="flex flex-col gap-[24px]">
    <Typography.Heading type="h3">提示与定位</Typography.Heading>
    <Tooltip openOn="press" duration={0} label="查看组件说明">
      <Tooltip.Trigger>
        <Button id="panel-tooltip-open" variant="outline">
          点击提示
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content id="panel-tooltip">
        <Tooltip.Arrow />
        PanelUI 默认提示
      </Tooltip.Content>
    </Tooltip>
    <Tooltip duration={0} label="长按查看详情">
      <Tooltip.Trigger>
        <Button id="panel-tooltip-long" variant="outline">
          长按提示
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content id="panel-tooltip-surface" variant="surface" width={220}>
        <Tooltip.Arrow />
        <Tooltip.Title>组件详情</Tooltip.Title>
        <Tooltip.Description>
          表面、箭头和文字共用当前主题。
        </Tooltip.Description>
      </Tooltip.Content>
    </Tooltip>
  </View>
);
