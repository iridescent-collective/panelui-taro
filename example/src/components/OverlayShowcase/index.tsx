import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Dialog } from "panelui-taro/dialog";
import { Frame } from "panelui-taro/frame";
import { GridItem } from "panelui-taro/grid-item";
import { Meter } from "panelui-taro/meter";
import { NumberInput } from "panelui-taro/number-input";
import { Switch } from "panelui-taro/switch";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const OverlayShowcase = () => {
  const [open, setOpen] = useState(false);
  const [child, setChild] = useState(false);
  const [number, setNumber] = useState(2);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography.Heading type="h3">布局与弹层</Typography.Heading>
      <NumberInput
        id="panel-number"
        label="数量"
        value={number}
        onValueChange={setNumber}
        min={0}
        max={5}
        step={0.5}
        description="步进与输入"
      />
      <Meter
        value={number}
        maxValue={5}
        segments={5}
        label="分段测量"
        showValueLabel
        thresholds={[
          { color: "success", from: 3 },
          { color: "warning", from: 4 },
        ]}
      />
      <View id="panel-native-refused">
        <Switch native value={false} label="原生受控回退" />
      </View>
      <Frame variant="inset" id="panel-frame">
        <Frame.Header>
          <Frame.Title>PanelUI Frame</Frame.Title>
          <Frame.Action>2</Frame.Action>
        </Frame.Header>
        <Frame.Panel>
          <Frame.Row chevron>
            <Frame.Content>
              <Frame.Title>
                这是一个需要截断显示的非常长的设备标题，不能挤走右侧操作
              </Frame.Title>
              <Frame.Description>
                这里是一段两行说明，使用上游默认字号与文字层级，验证内容容器的收缩与换行。
              </Frame.Description>
            </Frame.Content>
            <Frame.Actions>
              <Button size="sm" variant="secondary">
                查看
              </Button>
            </Frame.Actions>
          </Frame.Row>
          <Frame.Row>
            <Frame.Content>
              <Frame.Title>第二行</Frame.Title>
            </Frame.Content>
            <Frame.Actions>在线</Frame.Actions>
          </Frame.Row>
        </Frame.Panel>
        <Frame.Footer>
          <Button variant="secondary">取消</Button>
          <Button>确认</Button>
        </Frame.Footer>
      </Frame>
      <GridItem.Group columns={2} gap={12} rowHeight={100}>
        <GridItem rowSpan={2}>
          <GridItem.Title>高卡片</GridItem.Title>
          <GridItem.Value>42</GridItem.Value>
          <GridItem.Footer>底部</GridItem.Footer>
        </GridItem>
        <GridItem>
          <GridItem.Title>第一行</GridItem.Title>
        </GridItem>
        <GridItem>
          <GridItem.Title>填入空位</GridItem.Title>
        </GridItem>
      </GridItem.Group>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Trigger>
          <Button id="panel-dialog-open">打开 Dialog</Button>
        </Dialog.Trigger>
        <Dialog.Content id="panel-dialog-content">
          <Dialog.Title>PanelUI Dialog</Dialog.Title>
          <Dialog.Description>默认主题与底栏</Dialog.Description>
          <Dialog open={child} onOpenChange={setChild}>
            <Dialog.Trigger>
              <Button id="panel-dialog-child-open" variant="secondary">
                嵌套弹层
              </Button>
            </Dialog.Trigger>
            <Dialog.Content id="panel-dialog-child">
              <Dialog.Title>第二层</Dialog.Title>
              <Dialog.Close>
                <Button id="panel-dialog-child-close">关闭第二层</Button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog>
          <Dialog.Footer variant="panel">
            <Dialog.Close>
              <Button id="panel-dialog-close" variant="secondary">
                关闭
              </Button>
            </Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
      <Typography.Paragraph id="panel-dialog-status">
        主层：{open ? "打开" : "关闭"} · 子层：{child ? "打开" : "关闭"}
      </Typography.Paragraph>
    </View>
  );
};
