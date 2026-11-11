import { Badge } from "panelui-taro/badge";
import { GridItem } from "panelui-taro/grid-item";
import {
  BellIcon,
  CalendarIcon,
  ChevronRightIcon,
  PackageIcon,
  PlusSquareIcon,
  ReceiptIcon,
  SearchIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "panelui-taro/icons";
import { LineChart } from "panelui-taro/line-chart";
import { Text } from "panelui-taro/primitives/text";
import { useState, type ReactNode } from "react";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { useCSSVariable } from "../runtime/theme";
import { ComponentEntry } from "../types";
function GridItemBentoDemo() {
  return (
    <GridItem.Group columns={2} gap={12} rowHeight={164} className="w-full">
      <GridItem colSpan={2}>
        <GridItem.Media variant="icon">
          <SparklesIcon size={18} />
        </GridItem.Media>
        <GridItem.Title>Deploys</GridItem.Title>
        <GridItem.Value>1,284</GridItem.Value>
        <GridItem.Description numberOfLines={1}>
          this week, across 12 projects
        </GridItem.Description>
      </GridItem>
      <GridItem>
        <GridItem.Title>Uptime</GridItem.Title>
        <GridItem.Value>99.98%</GridItem.Value>
        <GridItem.Footer>
          <Badge variant="secondary">30 days</Badge>
        </GridItem.Footer>
      </GridItem>
      <GridItem variant="muted">
        <GridItem.Title>p95 latency</GridItem.Title>
        <GridItem.Value>142ms</GridItem.Value>
        <GridItem.Description numberOfLines={1}>down 18ms</GridItem.Description>
      </GridItem>
    </GridItem.Group>
  );
}
function GridItemSpansDemo() {
  return (
    <GridItem.Group columns={3} gap={10} className="w-full">
      <GridItem rowSpan={2} variant="muted">
        <GridItem.Title>rowSpan 2</GridItem.Title>
        <GridItem.Description>
          Two rows tall. The next tiles fill in beside it.
        </GridItem.Description>
      </GridItem>
      <GridItem colSpan={2}>
        <GridItem.Title>colSpan 2</GridItem.Title>
      </GridItem>
      <GridItem>
        <GridItem.Title>1 × 1</GridItem.Title>
      </GridItem>
      <GridItem>
        <GridItem.Title>1 × 1</GridItem.Title>
      </GridItem>
      <GridItem colSpan={3} variant="outline">
        <GridItem.Title>colSpan 3</GridItem.Title>
        <GridItem.Description>
          A full-width band under the rest.
        </GridItem.Description>
      </GridItem>
    </GridItem.Group>
  );
}
function GridItemPressableDemo() {
  const [opened, setOpened] = useState<string | null>(null);
  const tiles = [
    { key: "billing", label: "Billing", caption: "3 invoices due" },
    { key: "team", label: "Team", caption: "12 members" },
    { key: "keys", label: "API keys", caption: "2 active" },
    { key: "logs", label: "Logs", caption: "Live" },
  ];
  return (
    <View className="w-full gap-3">
      <GridItem.Group columns={2} gap={12} aspect={1.9} size="sm">
        {tiles.map((tile) => (
          <GridItem key={tile.key} onPress={() => setOpened(tile.label)}>
            <GridItem.Title>{tile.label}</GridItem.Title>
            <GridItem.Footer>
              <Text size="xs" className="text-muted-foreground flex-1">
                {tile.caption}
              </Text>
              <ChevronRightIcon size={14} />
            </GridItem.Footer>
          </GridItem>
        ))}
      </GridItem.Group>
      <Text size="xs" muted className="text-center">
        {opened ? `Opened ${opened}` : "Press a tile"}
      </Text>
    </View>
  );
}
function GridItemCompactDemo() {
  const shortcuts = [
    { label: "Search", icon: <SearchIcon size={16} /> },
    { label: "Upload", icon: <PackageIcon size={16} /> },
    { label: "Invite", icon: <PlusSquareIcon size={16} /> },
    { label: "Export", icon: <ReceiptIcon size={16} /> },
    { label: "Schedule", icon: <CalendarIcon size={16} /> },
    { label: "Alerts", icon: <BellIcon size={16} /> },
  ];
  return (
    <GridItem.Group columns={3} gap={10} size="sm" className="w-full">
      {shortcuts.map((shortcut) => (
        <GridItem
          key={shortcut.label}
          onPress={demoAction("GridItem selected")}
        >
          <GridItem.Media variant="icon">{shortcut.icon}</GridItem.Media>
          <GridItem.Footer>
            <GridItem.Title numberOfLines={1}>{shortcut.label}</GridItem.Title>
          </GridItem.Footer>
        </GridItem>
      ))}
    </GridItem.Group>
  );
}
const TILE_TREND = [
  { day: "M", v: 18 },
  { day: "T", v: 26 },
  { day: "W", v: 21 },
  { day: "T", v: 34 },
  { day: "F", v: 41 },
  { day: "S", v: 37 },
  { day: "S", v: 52 },
];
function GridItemBackgroundDemo() {
  return (
    <GridItem.Group columns={2} gap={12} rowHeight={132} className="w-full">
      <GridItem colSpan={2}>
        <GridItem.Background>
          <View className="mt-auto h-20 w-full opacity-60">
            <LineChart data={TILE_TREND} compact aspectRatio={3.4}>
              <LineChart.Area dataKey="v" />
              <LineChart.Line dataKey="v" />
            </LineChart>
          </View>
        </GridItem.Background>
        <GridItem.Title>Requests</GridItem.Title>
        <GridItem.Value>52.4k</GridItem.Value>
        <GridItem.Description>up 41% on last week</GridItem.Description>
      </GridItem>
      <GridItem variant="muted">
        <GridItem.Background>
          <View className="absolute -right-3 -bottom-4 opacity-10">
            <SparklesIcon size={96} />
          </View>
        </GridItem.Background>
        <GridItem.Title>Cache hits</GridItem.Title>
        <GridItem.Value>94%</GridItem.Value>
      </GridItem>
      <GridItem variant="outline">
        <GridItem.Title>Errors</GridItem.Title>
        <GridItem.Value>7</GridItem.Value>
        <GridItem.Description>none critical</GridItem.Description>
      </GridItem>
    </GridItem.Group>
  );
}
const WATERMARKS: {
  label: string;
  value: string;
  caption: string;
  icon: (color: string) => ReactNode;
  token: string;
}[] = [
  {
    label: "Cache hits",
    value: "94%",
    caption: "of 2.1M lookups",
    icon: (color) => <SparklesIcon size={72} color={color} />,
    token: "--color-chart-1",
  },
  {
    label: "Alerts",
    value: "3",
    caption: "two acknowledged",
    icon: (color) => <BellIcon size={72} color={color} />,
    token: "--color-chart-2",
  },
  {
    label: "Blocked",
    value: "1,902",
    caption: "requests today",
    icon: (color) => <ShieldCheckIcon size={72} color={color} />,
    token: "--color-chart-3",
  },
  {
    label: "Bundles",
    value: "48 MB",
    caption: "served from the edge",
    icon: (color) => <PackageIcon size={72} color={color} />,
    token: "--color-chart-4",
  },
];
function WatermarkTile({ tile }: { tile: (typeof WATERMARKS)[number] }) {
  const token = useCSSVariable(tile.token);
  const tint = typeof token === "string" ? token : undefined;
  return (
    <GridItem>
      <GridItem.Background>
        <View className="absolute -right-5 -bottom-6 opacity-[0.14]">
          {tile.icon(tint ?? "#888888")}
        </View>
      </GridItem.Background>
      <GridItem.Title>{tile.label}</GridItem.Title>
      <GridItem.Value>{tile.value}</GridItem.Value>
      <GridItem.Footer>
        <Text size="xs" muted numberOfLines={1}>
          {tile.caption}
        </Text>
      </GridItem.Footer>
    </GridItem>
  );
}
function GridItemWatermarksDemo() {
  return (
    <GridItem.Group columns={2} gap={12} rowHeight={132} className="w-full">
      {WATERMARKS.map((tile) => (
        <WatermarkTile key={tile.label} tile={tile} />
      ))}
    </GridItem.Group>
  );
}
export const entry: ComponentEntry = {
  slug: "grid-item",
  name: "GridItem",
  summary: "Bento tiles, and the grid that places them",
  demos: [
    { label: "A bento of stats", render: () => <GridItemBentoDemo /> },
    { label: "Spans", render: () => <GridItemSpansDemo /> },
    { label: "Behind the text", render: () => <GridItemBackgroundDemo /> },
    { label: "A wall of watermarks", render: () => <GridItemWatermarksDemo /> },
    { label: "Pressable tiles", render: () => <GridItemPressableDemo /> },
    { label: "Three across", render: () => <GridItemCompactDemo /> },
  ],
};
