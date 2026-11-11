import { View } from "@tarojs/components";
import { BottomSheet } from "panelui-taro/bottom-sheet";
import { Button } from "panelui-taro/button";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const ROWS = Array.from({ length: 24 }, (_, index) => ({
  id: `row-${index + 1}`,
  label: `列表项 ${index + 1}`,
}));
export const SheetShowcase = () => {
  const [open, setOpen] = useState(false);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">手势底部弹层</Typography.Heading>
      <BottomSheet open={open} onOpenChange={setOpen}>
        <BottomSheet.Trigger>
          <Button id="panel-sheet-open">打开 BottomSheet</Button>
        </BottomSheet.Trigger>
        <BottomSheet.Content id="panel-sheet" size="half">
          <BottomSheet.Header
            title="PanelUI BottomSheet"
            description="固定头尾与滚动接管"
          />
          <BottomSheet.Body id="panel-sheet-body">
            {ROWS.map((row) => (
              <View key={row.id} className="py-[16px]">
                <Typography.Paragraph>{row.label}</Typography.Paragraph>
              </View>
            ))}
          </BottomSheet.Body>
          <BottomSheet.Footer id="panel-sheet-footer">
            <Button id="panel-sheet-close" onPress={() => setOpen(false)}>
              完成
            </Button>
          </BottomSheet.Footer>
        </BottomSheet.Content>
      </BottomSheet>
      <Typography.Paragraph id="panel-sheet-status">
        {open ? "弹层已打开" : "弹层已关闭"}
      </Typography.Paragraph>
    </View>
  );
};
