import { View } from "@tarojs/components";
import { Accordion } from "panelui-taro/accordion";
import { Button } from "panelui-taro/button";
import { Collapsible } from "panelui-taro/collapsible";
import { Input } from "panelui-taro/input";
import { InputGroup } from "panelui-taro/input-group";
import { ThemeSelector } from "panelui-taro/theme-selector";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

const ChangingPrefix = () => {
  const [wide, setWide] = useState(false);
  return (
    <Button
      size="sm"
      variant="ghost"
      id="panel-prefix-grow"
      onClick={() => setWide(!wide)}
    >
      {wide ? "1000" : "9"}
    </Button>
  );
};
const StatefulBody = ({ name }: { name: string }) => {
  const [text, setText] = useState("");
  return (
    <Input
      id={
        name === "保留状态" ? "panel-retained-input" : "panel-unmounted-input"
      }
      label={name}
      value={text}
      onChangeText={setText}
    />
  );
};
export const StructureShowcase = () => (
  <View className="flex flex-col gap-[32px]">
    <Typography.Heading type="h3">组合与折叠</Typography.Heading>
    <InputGroup>
      <InputGroup.Prefix>
        <ChangingPrefix />
      </InputGroup.Prefix>
      <InputGroup.Input
        id="panel-group-input"
        placeholder="点左侧改变装饰宽度"
      />
      <InputGroup.Suffix>元</InputGroup.Suffix>
    </InputGroup>
    <Collapsible variant="surface" defaultOpen>
      <Collapsible.Trigger id="panel-collapse-toggle">
        <Collapsible.Title>折叠后保留输入</Collapsible.Title>
        <Collapsible.Indicator />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <StatefulBody name="保留状态" />
      </Collapsible.Content>
    </Collapsible>
    <Accordion variant="bordered" defaultValue="first">
      <Accordion.Item value="first">
        <Accordion.Trigger id="panel-accordion-first">
          <Accordion.Title>默认关闭时卸载</Accordion.Title>
          <Accordion.Indicator />
        </Accordion.Trigger>
        <Accordion.Content>
          <StatefulBody name="卸载状态" />
        </Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="second">
        <Accordion.Trigger id="panel-accordion-second">
          <Accordion.Title>第二项</Accordion.Title>
          <Accordion.Indicator />
        </Accordion.Trigger>
        <Accordion.Content>单选展开</Accordion.Content>
      </Accordion.Item>
    </Accordion>
    <ThemeSelector label="PanelUI 主题" />
    <ThemeSelector label="卡片缩略图" variant="card" size="sm" />
  </View>
);
