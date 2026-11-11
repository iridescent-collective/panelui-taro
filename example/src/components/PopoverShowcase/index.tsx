import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Popover } from "panelui-taro/popover";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const ROWS = Array.from({ length: 16 }, (_, index) => ({
  id: `popover-${index + 1}`,
  label: `浮层列表项 ${index + 1}`,
}));
export const PopoverShowcase = () => {
  const [open, setOpen] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">锚点浮层</Typography.Heading>
      <View className="flex justify-end">
        <Popover open={open} onOpenChange={setOpen}>
          <Popover.Trigger>
            <Button id="panel-popover-open">打开 Popover</Button>
          </Popover.Trigger>
          <Popover.Content
            id="panel-popover"
            width={240}
            maxHeight={240}
            scrollable
            placement="top"
            align="start"
          >
            <Popover.Arrow id="panel-popover-arrow" />
            <Popover.Title>PanelUI Popover</Popover.Title>
            <Popover.Description>定位与滚动</Popover.Description>
            {ROWS.map((row) => (
              <Typography.Paragraph key={row.id}>
                {row.label}
              </Typography.Paragraph>
            ))}
            <Popover.Close>
              <Button id="panel-popover-close" variant="outline">
                关闭
              </Button>
            </Popover.Close>
          </Popover.Content>
        </Popover>
      </View>
      <Typography.Paragraph id="panel-popover-status">
        {open ? "浮层已打开" : "浮层已关闭"}
      </Typography.Paragraph>
    </View>
  );
};
