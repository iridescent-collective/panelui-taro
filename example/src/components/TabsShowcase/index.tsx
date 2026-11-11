import { View } from "@tarojs/components";
import { FolderIcon, SearchIcon } from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { Tabs } from "panelui-taro/tabs";
import { Typography } from "panelui-taro/typography";

export const TabsShowcase = () => (
  <View className="flex flex-col gap-[24px]">
    <Typography.Heading type="h3">标签与面板</Typography.Heading>
    <Tabs id="panel-tabs" defaultValue="a" keepMounted>
      <Tabs.List id="panel-tabs-list">
        <Tabs.Trigger className="panel-tab-a" value="a">
          练习
        </Tabs.Trigger>
        <Tabs.Trigger className="panel-tab-b" value="b">
          留言
        </Tabs.Trigger>
        <Tabs.Trigger value="c" disabled>
          停用
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="a">
        <Input id="panel-tabs-field" placeholder="切换后保留输入" />
      </Tabs.Content>
      <Tabs.Content value="b">
        <Typography.Paragraph>第二个面板</Typography.Paragraph>
      </Tabs.Content>
    </Tabs>
    <Tabs defaultValue="a" variant="underline" size="sm">
      <Tabs.List scrollable>
        <Tabs.Trigger value="a">学习计划</Tabs.Trigger>
        <Tabs.Trigger value="b">课程回顾</Tabs.Trigger>
        <Tabs.Trigger value="c">我的收藏</Tabs.Trigger>
        <Tabs.Trigger value="d">设备活动</Tabs.Trigger>
      </Tabs.List>
    </Tabs>
    <Tabs defaultValue="a" variant="pill">
      <Tabs.List>
        <Tabs.Trigger value="a">今天</Tabs.Trigger>
        <Tabs.Trigger value="b">本周</Tabs.Trigger>
      </Tabs.List>
    </Tabs>
    <Tabs defaultValue="a" variant="expanding">
      <Tabs.List>
        <Tabs.Trigger
          value="a"
          className="panel-tab-expand-a"
          icon={<FolderIcon size={18} />}
        >
          首页
        </Tabs.Trigger>
        <Tabs.Trigger
          value="b"
          className="panel-tab-expand-b"
          icon={<SearchIcon size={18} />}
        >
          搜索
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs>
    <Tabs
      id="panel-tabs-pager"
      defaultValue="a"
      swipeable
      className="h-[320px]"
    >
      <Tabs.List>
        <Tabs.Trigger value="a" className="panel-page-a">
          面板 A
        </Tabs.Trigger>
        <Tabs.Trigger value="b" className="panel-page-b">
          面板 B
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content
        value="a"
        className="justify-center bg-[var(--panel-muted)] p-[24px]"
      >
        滑动面板 A
      </Tabs.Content>
      <Tabs.Content
        value="b"
        className="justify-center bg-[var(--panel-surface-secondary)] p-[24px]"
      >
        滑动面板 B
      </Tabs.Content>
    </Tabs>
  </View>
);
