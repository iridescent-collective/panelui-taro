import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import {
  BellIcon,
  CalendarIcon,
  MessageCircleIcon,
  PackageIcon,
} from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { Tabs } from "panelui-taro/tabs";
import { ToggleButton, ToggleButtonGroup } from "panelui-taro/toggle-button";
import { Typography } from "panelui-taro/typography";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { FlatList, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const TAB_SECTIONS = [
  "Overview",
  "Activity",
  "Members",
  "Billing",
  "Integrations",
  "Security",
  "Audit log",
];
function ScrollableTabsDemo() {
  return (
    <Tabs variant="underline" defaultValue="Overview" className="w-full">
      <Tabs.List scrollable>
        {TAB_SECTIONS.map((section) => (
          <Tabs.Trigger key={section} value={section}>
            {section}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {TAB_SECTIONS.map((section) => (
        <Tabs.Content key={section} value={section}>
          <Text size="sm" muted className="py-4">
            {section}
          </Text>
        </Tabs.Content>
      ))}
    </Tabs>
  );
}
function KeepMountedTabsDemo() {
  return (
    <Tabs keepMounted defaultValue="draft" className="w-full">
      <Tabs.List>
        <Tabs.Trigger value="draft">Draft</Tabs.Trigger>
        <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="draft">
        <Card>
          <Card.Content className="gap-3 p-4">
            <Input
              label="Title"
              placeholder="Type something, then switch tab"
            />
            <Text size="xs" muted>
              This panel stays mounted, so what you type survives the switch.
            </Text>
          </Card.Content>
        </Card>
      </Tabs.Content>
      <Tabs.Content value="settings">
        <Card>
          <Card.Content className="p-4">
            <Text size="sm" muted>
              Switch back to Draft — the title you typed is still in the field.
            </Text>
          </Card.Content>
        </Card>
      </Tabs.Content>
    </Tabs>
  );
}
function SwipeableTabsDemo() {
  const days = [
    { value: "mon", label: "Mon", body: "Two runs and a swim. 14km total." },
    { value: "tue", label: "Tue", body: "Rest day. Nothing logged." },
    {
      value: "wed",
      label: "Wed",
      body: "One long ride, 62km, out to the coast.",
    },
    { value: "thu", label: "Thu", body: "Intervals — 8 × 400m on the track." },
  ];
  return (
    <Tabs swipeable defaultValue="mon" className="w-full">
      <Tabs.List scrollable>
        {days.map((day) => (
          <Tabs.Trigger key={day.value} value={day.value}>
            {day.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {days.map((day) => (
        <Tabs.Content key={day.value} value={day.value}>
          <Card>
            <Card.Content className="gap-2 p-4">
              <Text weight="medium">{day.label}</Text>
              <Text size="sm" muted>
                {day.body}
              </Text>
              <Text size="xs" muted className="mt-2">
                Swipe left or right on this card.
              </Text>
            </Card.Content>
          </Card>
        </Tabs.Content>
      ))}
    </Tabs>
  );
}
const KEPT_PANEL_ROWS = Array.from({ length: 400 }, (_, index) => ({
  id: String(index),
  title: `Rule ${index + 1}`,
  detail: `${["Allow", "Deny", "Redirect"][index % 3]} · priority ${index + 1}`,
}));
function KeptPanelTabsDemo() {
  const [measured, setMeasured] = useState(true);
  const panels = ["users", "domains", "routing"];
  return (
    <View className="flex-1 gap-3 px-4 pt-3">
      <ToggleButtonGroup
        value={measured ? ["measured"] : []}
        onValueChange={(value) => setMeasured(value.includes("measured"))}
        size="sm"
      >
        <ToggleButton id="measured">
          keepMounted=&quot;measured&quot;
        </ToggleButton>
      </ToggleButtonGroup>

      <Text size="xs" muted>
        {measured
          ? "Panels stay laid out while hidden — each list is already built, so switching is immediate."
          : "Panels are hidden with display: none — each list builds on the frame you switch to it."}
      </Text>

      <Tabs
        key={measured ? "measured" : "true"}
        defaultValue="users"
        keepMounted={measured ? "measured" : true}
        swipeable
        className="flex-1"
      >
        <Tabs.List>
          {panels.map((panel) => (
            <Tabs.Trigger key={panel} value={panel} className="capitalize">
              {panel}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {panels.map((panel) => (
          <Tabs.Content key={panel} value={panel} className="flex-1">
            <FlatList
              data={KEPT_PANEL_ROWS}
              keyExtractor={(row) => `${panel}-${row.id}`}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Item>
                  <Item.Content>
                    <Item.Title>{item.title}</Item.Title>
                    <Item.Description>{item.detail}</Item.Description>
                  </Item.Content>
                </Item>
              )}
            />
          </Tabs.Content>
        ))}
      </Tabs>
    </View>
  );
}
const EXPANDING_TABS = [
  {
    value: "home",
    label: "Home",
    icon: <PackageIcon size={18} />,
    body: "Everything that changed since you were last here.",
  },
  {
    value: "chats",
    label: "Chats",
    icon: <MessageCircleIcon size={18} />,
    body: "Four threads, two of them waiting on you.",
  },
  {
    value: "calendar",
    label: "Calendar",
    icon: <CalendarIcon size={18} />,
    body: "Nothing until Thursday, and then rather a lot.",
  },
  {
    value: "inbox",
    label: "Inbox",
    icon: <BellIcon size={18} />,
    body: "Three notifications, none of them urgent.",
  },
];
function ExpandingTabsDemo() {
  return (
    <Tabs swipeable variant="expanding" defaultValue="chats" className="w-full">
      <Tabs.List className="justify-center">
        {EXPANDING_TABS.map((tab) => (
          <Tabs.Trigger key={tab.value} value={tab.value} icon={tab.icon}>
            {tab.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      {EXPANDING_TABS.map((tab) => (
        <Tabs.Content key={tab.value} value={tab.value}>
          <Card>
            <Card.Content className="gap-2 p-4">
              <Text weight="medium">{tab.label}</Text>
              <Text size="sm" muted>
                {tab.body}
              </Text>
            </Card.Content>
          </Card>
        </Tabs.Content>
      ))}
    </Tabs>
  );
}
export const entry: ComponentEntry = {
  slug: "tabs",
  name: "Tabs",
  summary: "Segmented navigation between panels",
  demos: [
    {
      label: "Basic",
      render: () => (
        <Tabs defaultValue="account" className="w-full">
          <Tabs.List>
            <Tabs.Trigger value="account">Account</Tabs.Trigger>
            <Tabs.Trigger value="password">Password</Tabs.Trigger>
            <Tabs.Trigger value="team">Team</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="account">
            <Card>
              <Card.Content className="gap-4 p-4">
                <Input label="Name" placeholder="Khalid Abdi" />
                <Input label="Username" placeholder="@khalid" />
              </Card.Content>
            </Card>
          </Tabs.Content>
          <Tabs.Content value="password">
            <Card>
              <Card.Content className="gap-4 p-4">
                <Input label="Current password" secureTextEntry />
                <Input label="New password" secureTextEntry />
              </Card.Content>
            </Card>
          </Tabs.Content>
          <Tabs.Content value="team">
            <Card>
              <Card.Content className="flex-row items-center gap-3 p-4">
                <Avatar fallback="KA" />
                <View className="flex-1">
                  <Text weight="medium">Khalid Abdi</Text>
                  <Text size="sm" muted>
                    Owner
                  </Text>
                </View>
                <Badge variant="secondary">Admin</Badge>
              </Card.Content>
            </Card>
          </Tabs.Content>
        </Tabs>
      ),
    },
    {
      label: "Two panels",
      render: () => (
        <Tabs defaultValue="preview" className="w-full">
          <Tabs.List>
            <Tabs.Trigger value="preview">Preview</Tabs.Trigger>
            <Tabs.Trigger value="code">Code</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="preview">
            <Card>
              <Card.Content className="items-center p-8">
                <Button onPress={demoAction("Click me")}>Click me</Button>
              </Card.Content>
            </Card>
          </Tabs.Content>
          <Tabs.Content value="code">
            <Card>
              <Card.Content className="p-4">
                <Typography.Code>{"<Button>Click me</Button>"}</Typography.Code>
              </Card.Content>
            </Card>
          </Tabs.Content>
        </Tabs>
      ),
    },
    {
      label: "Underline",
      render: () => (
        <Tabs variant="underline" defaultValue="overview" className="w-full">
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger
              value="activity"
              badge={<Badge variant="secondary">4</Badge>}
            >
              Activity
            </Tabs.Trigger>
            <Tabs.Trigger value="archived" disabled>
              Archived
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="overview">
            <Text size="sm" muted className="py-4">
              A rule under the active tab, on a row that has no track of its own
              — for a page-level switch rather than a control.
            </Text>
          </Tabs.Content>
          <Tabs.Content value="activity">
            <Text size="sm" muted className="py-4">
              Four things happened while you were away.
            </Text>
          </Tabs.Content>
          <Tabs.Content value="archived">
            <Text size="sm" muted className="py-4">
              Unreachable — the trigger is disabled.
            </Text>
          </Tabs.Content>
        </Tabs>
      ),
    },
    {
      label: "Pill",
      render: () => (
        <Tabs variant="pill" defaultValue="all" className="w-full">
          <Tabs.List>
            <Tabs.Trigger value="all">All</Tabs.Trigger>
            <Tabs.Trigger value="unread">Unread</Tabs.Trigger>
            <Tabs.Trigger value="flagged">Flagged</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="all">
            <Text size="sm" muted className="py-4">
              A filled chip on the page, with the active label inverted against
              it.
            </Text>
          </Tabs.Content>
          <Tabs.Content value="unread">
            <Text size="sm" muted className="py-4">
              Nothing unread.
            </Text>
          </Tabs.Content>
          <Tabs.Content value="flagged">
            <Text size="sm" muted className="py-4">
              Nothing flagged.
            </Text>
          </Tabs.Content>
        </Tabs>
      ),
    },
    {
      label: "Custom colours",
      render: () => (
        <View className="w-full gap-6">
          <Tabs defaultValue="week">
            <Tabs.List indicatorClassName="bg-primary">
              {["Day", "Week", "Month"].map((name) => (
                <Tabs.Trigger
                  key={name}
                  value={name.toLowerCase()}
                  labelClassName="text-success"
                  activeLabelClassName="text-primary-foreground"
                >
                  {name}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
          <Tabs variant="underline" defaultValue="open">
            <Tabs.List indicatorClassName="h-1 bg-success">
              {["Open", "Merged", "Closed"].map((name) => (
                <Tabs.Trigger
                  key={name}
                  value={name.toLowerCase()}
                  activeLabelClassName="text-success"
                >
                  {name}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
          <Tabs variant="expanding" defaultValue="inbox">
            <Tabs.List>
              {[
                {
                  value: "inbox",
                  label: "Inbox",
                  icon: <BellIcon size={18} />,
                },
                {
                  value: "activity",
                  label: "Activity",
                  icon: <CalendarIcon size={18} />,
                },
                {
                  value: "messages",
                  label: "Messages",
                  icon: <MessageCircleIcon size={18} />,
                },
              ].map(({ value, label, icon }) => (
                <Tabs.Trigger
                  key={value}
                  value={value}
                  icon={icon}
                  activeClassName="bg-primary"
                  labelClassName="text-success"
                  activeLabelClassName="text-primary-foreground"
                >
                  {label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-5">
          {(["xs", "sm", "md", "lg", "xl"] as const).map((size) => (
            <Tabs key={size} size={size} defaultValue="week">
              <Tabs.List>
                <Tabs.Trigger value="day">Day</Tabs.Trigger>
                <Tabs.Trigger value="week">Week</Tabs.Trigger>
                <Tabs.Trigger value="month">Month</Tabs.Trigger>
              </Tabs.List>
            </Tabs>
          ))}
        </View>
      ),
    },
    {
      label: "Scrollable",
      render: () => <ScrollableTabsDemo />,
    },
    {
      label: "Keeping panels mounted",
      render: () => <KeepMountedTabsDemo />,
    },
    {
      label: "Swiping between panels",
      render: () => <SwipeableTabsDemo />,
    },
    {
      label: "Icons that open",
      render: () => <ExpandingTabsDemo />,
    },
    {
      label: "Panels that keep their size",
      id: "kept-panels",
      fullPage: true,
      description:
        'Long lists in every panel, switched with keepMounted at "measured" and at true.',
      render: () => <KeptPanelTabsDemo />,
    },
  ],
};
