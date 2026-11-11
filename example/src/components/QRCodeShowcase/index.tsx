import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import { Input } from "panelui-taro/input";
import { QRCode } from "panelui-taro/qr-code";
import type { QRCodeModuleShape } from "panelui-taro/qr-code";
import { Select } from "panelui-taro/select";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const SHAPES: QRCodeModuleShape[] = [
  "square",
  "rounded",
  "dot",
  "classy",
  "diamond",
];
export const QRCodeShowcase = () => {
  const [value, setValue] = useState("https://panelui.dev");
  const [shape, setShape] = useState<QRCodeModuleShape>("rounded");
  const [logo, setLogo] = useState(true);
  return (
    <View className="flex flex-col gap-[24px]">
      <Typography.Heading type="h3">QRCode · 形状与展示</Typography.Heading>
      <Input
        aria-label="编码内容"
        className="panel-qr-value"
        value={value}
        onChangeText={setValue}
      />
      <Select
        valueLabel={shape}
        title="模块形状"
        value={shape}
        onValueChange={(next) => {
          const match = SHAPES.find((entry) => entry === next);
          if (match) {
            setShape(match);
          }
        }}
      >
        {SHAPES.map((entry) => (
          <Select.Item key={entry} value={entry} label={entry} />
        ))}
      </Select>
      <QRCode value={value} errorCorrection="L" id="panel-qr-inline">
        <QRCode.Frame>
          <QRCode.Header>
            <QRCode.Title>PanelUI</QRCode.Title>
            <QRCode.Action>扫码预览</QRCode.Action>
          </QRCode.Header>
          <QRCode.Panel>
            <QRCode.Canvas
              className="panel-qr-canvas"
              moduleShape={shape}
              eyeFrameShape="rounded"
              eyeBallShape="rounded"
            />
            {logo && (
              <QRCode.Logo>
                <Typography.Heading type="h3">P</Typography.Heading>
              </QRCode.Logo>
            )}
          </QRCode.Panel>
        </QRCode.Frame>
        <QRCode.Caption>使用相机读取</QRCode.Caption>
        <QRCode.Value full />
      </QRCode>
      <Button
        variant="outline"
        className="panel-qr-logo-toggle"
        onPress={() => setLogo(!logo)}
      >
        {logo ? "移除 Logo" : "添加 Logo"}
      </Button>
      <QRCode value={value} presentation="bottom-sheet">
        <QRCode.Trigger>
          <Button className="panel-qr-open">底部展示</Button>
        </QRCode.Trigger>
        <QRCode.Content>
          <QRCode.Canvas />
          <QRCode.Description>相同编码内容</QRCode.Description>
          <QRCode.Value />
        </QRCode.Content>
      </QRCode>
    </View>
  );
};
