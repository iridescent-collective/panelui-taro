import { View } from "@tarojs/components";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { ButtonGroup } from "panelui-taro/button-group";
import { Card } from "panelui-taro/card";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const ActionShowcase = () => {
  const [presses, setPresses] = useState(0);
  return (
    <Card>
      <Card.Header>
        <Card.Title>按钮与状态</Card.Title>
        <Card.Description>
          点击主按钮验证事件；禁用与加载按钮不会触发操作。
        </Card.Description>
      </Card.Header>
      <Card.Content className="flex flex-col gap-[24px]">
        <Button fullWidth onPress={() => setPresses((value) => value + 1)}>
          主按钮 · {presses}
        </Button>
        <View className="flex flex-row flex-wrap gap-[16px]">
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="social">Social</Button>
        </View>
        <Button
          loading
          fullWidth
          onPress={() => setPresses((value) => value + 1)}
        >
          正在保存
        </Button>
        <Button
          disabled
          fullWidth
          onPress={() => setPresses((value) => value + 1)}
        >
          禁用按钮
        </Button>
        <ButtonGroup fullWidth>
          <Button>日</Button>
          <Button variant="secondary">周</Button>
          <Button>月</Button>
        </ButtonGroup>
        <View className="flex flex-row flex-wrap items-center gap-[16px]">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge count={142} />
          <Badge shape="dot" variant="success" />
        </View>
        <Typography.Paragraph muted>已触发 {presses} 次</Typography.Paragraph>
      </Card.Content>
    </Card>
  );
};
