import { View } from "@tarojs/components";
import { Avatar } from "panelui-taro/avatar";
import { Breadcrumb } from "panelui-taro/breadcrumb";
import { Button } from "panelui-taro/button";
import { Chip } from "panelui-taro/chip";
import { Countdown } from "panelui-taro/countdown";
import { EmptyState } from "panelui-taro/empty-state";
import { CheckIcon, FileIcon } from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

export const PresentationShowcase = () => {
  const [target] = useState(() => Date.now() + 90_000);
  const [selected, setSelected] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [presses, setPresses] = useState(0);
  const [clickDisabled, setClickDisabled] = useState(true);
  return (
    <View className="flex flex-col gap-[32px]">
      <Typography.Heading type="h3">内容与交互</Typography.Heading>
      <Breadcrumb>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link onPress={() => setPresses(presses + 1)}>
              PanelUI
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Breadcrumb.Page>组件</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb>
      <Avatar.Group max={3} total={8}>
        <Avatar fallback="AL" />
        <Avatar fallback="SK" />
        <Avatar fallback="PN" />
      </Avatar.Group>
      <View className="flex flex-row gap-[16px]">
        <Chip
          selected={selected}
          id="panel-chip-toggle"
          onPress={() => {
            setSelected(!selected);
            setPresses(presses + 1);
          }}
        >
          <CheckIcon />
          <Chip.Label>筛选</Chip.Label>
        </Chip>
        {removed ? null : (
          <Chip
            onPress={() => setPresses(presses + 1)}
            onClose={() => setRemoved(true)}
            closeLabel="移除标签"
          >
            可移除
          </Chip>
        )}
      </View>
      <Typography.Paragraph id="panel-chip-status">
        触发 {presses} 次 · {removed ? "已移除" : "未移除"}
      </Typography.Paragraph>
      <View className="flex flex-col gap-[16px]">
        <Chip
          id="panel-chip-native"
          disabled={clickDisabled}
          onClick={() => setPresses((value) => value + 1)}
        >
          Taro 点击标签
        </Chip>
        <Item
          id="panel-item-native"
          disabled={clickDisabled}
          onClick={() => setPresses((value) => value + 1)}
          variant="outline"
        >
          <Item.Title>Taro 点击列表项</Item.Title>
        </Item>
        <Button
          id="panel-click-guard-toggle"
          variant="secondary"
          onClick={() => setClickDisabled((value) => !value)}
        >
          {clickDisabled ? "启用点击检查" : "禁用点击检查"}
        </Button>
      </View>
      <Item variant="outline" size="sm">
        <Item.Media variant="icon">
          <FileIcon />
        </Item.Media>
        <Item.Content>
          <Item.Title>列表组件</Item.Title>
          <Item.Description>密度与媒体尺寸继承</Item.Description>
        </Item.Content>
        <Item.Actions>查看</Item.Actions>
      </Item>
      <Countdown
        to={target}
        labels={{ minutes: "分钟", seconds: "秒" }}
        urgentBelow={20}
      />
      <EmptyState variant="card" size="sm">
        <EmptyState.Header>
          <EmptyState.Media variant="icon">
            <FileIcon />
          </EmptyState.Media>
          <EmptyState.Title>EmptyState</EmptyState.Title>
        </EmptyState.Header>
      </EmptyState>
    </View>
  );
};
