import { Badge } from "panelui-taro/badge";
import {
  AppleIcon,
  BellIcon,
  CardIcon,
  CheckIcon,
  GoogleIcon,
  PlusSquareIcon,
  ReceiptIcon,
  SendIcon,
  ShareNodesIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from "panelui-taro/icons";
import { Item } from "panelui-taro/item";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import { Timeline } from "panelui-taro/timeline";
import { useState } from "react";

import { Image, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const PHOTO =
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=60";
const DEPLOY_LOG = [
  {
    time: "09:12",
    title: "Migration drafted",
    badge: "Assigned",
    tone: "default" as const,
    Icon: PlusSquareIcon,
    body: "Schema change written for the reporting cluster.",
  },
  {
    time: "09:34",
    title: "Shadow traffic enabled",
    badge: "Shadow",
    tone: "info" as const,
    Icon: ShareNodesIcon,
    body: "Mirroring 5% of reads with query timing captured.",
  },
  {
    time: "09:51",
    title: "Replica lag alarm",
    badge: "Holding",
    tone: "warning" as const,
    Icon: ShieldAlertIcon,
    body: "Lag passed 400ms in eu-west-2; the cutover is paused.",
  },
  {
    time: "10:05",
    title: "Runbook circulated",
    badge: "Docs",
    tone: "default" as const,
    Icon: BellIcon,
    body: "On-call has the rollback steps and the owner list.",
  },
  {
    time: "10:42",
    title: "Cutover approved",
    badge: "Ready",
    tone: "success" as const,
    Icon: ShieldCheckIcon,
    body: "Lag recovered and every pre-flight check is green.",
  },
];
function DeployLogDemo() {
  return (
    <View className="w-full gap-4">
      <View>
        <Text size="sm" muted>
          Migration audit
        </Text>
        <Text size="xl" weight="semibold">
          Reporting cluster
        </Text>
      </View>
      <Timeline variant="icon" value={DEPLOY_LOG.length - 1} className="w-full">
        {DEPLOY_LOG.map((entry, index) => (
          <Timeline.Item
            key={entry.title}
            step={index}
            tone={entry.tone}
            last={index === DEPLOY_LOG.length - 1}
          >
            <Timeline.Aside className="w-12">
              <Timeline.Date>{entry.time}</Timeline.Date>
            </Timeline.Aside>
            <Timeline.Indicator>
              <entry.Icon size={15} />
            </Timeline.Indicator>
            <Timeline.Content>
              <Timeline.Header>
                <Timeline.Title>{entry.title}</Timeline.Title>
                <Badge variant="secondary">{entry.badge}</Badge>
              </Timeline.Header>
              <Timeline.Description>{entry.body}</Timeline.Description>
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
    </View>
  );
}
function StudioFeedDemo() {
  return (
    <Timeline variant="dot" value={3} className="w-full">
      <Timeline.Item step={0} tone="info">
        <Timeline.Indicator />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Cover art uploaded</Timeline.Title>
            <Badge variant="info">Review</Badge>
            <Timeline.Trailing>10:18</Timeline.Trailing>
          </Timeline.Header>
          <View className="border-border mt-2 overflow-hidden rounded-xl border">
            <Image
              source={{ uri: PHOTO }}
              style={{ width: "100%", height: 140 }}
              resizeMode="cover"
            />
            <View className="gap-2 p-3">
              <Text size="sm" muted>
                Final crop is ready for retouch, with the detail shot and the
                thumbnail queued behind it.
              </Text>
              <View className="flex-row gap-2">
                <Badge variant="secondary">Hero</Badge>
                <Badge variant="secondary">4 crops</Badge>
              </View>
            </View>
          </View>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item step={1} tone="warning">
        <Timeline.Indicator />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Lighting pass reviewed</Timeline.Title>
            <Timeline.Trailing>10:27</Timeline.Trailing>
          </Timeline.Header>
          <Timeline.Description>
            The side profile reads clearly; keep the shadow soft.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item step={2} tone="success">
        <Timeline.Indicator />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Copy note resolved</Timeline.Title>
            <Timeline.Trailing>10:43</Timeline.Trailing>
          </Timeline.Header>
          <Timeline.Description>
            Launch tile copy now matches the campaign language.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
      <Timeline.Item step={3} tone="info" last>
        <Timeline.Indicator />
        <Timeline.Content>
          <Timeline.Header>
            <Timeline.Title>Package exported</Timeline.Title>
            <Timeline.Trailing>11:06</Timeline.Trailing>
          </Timeline.Header>
          <Timeline.Description>
            Square crop, product view and thumbnail are out.
          </Timeline.Description>
        </Timeline.Content>
      </Timeline.Item>
    </Timeline>
  );
}
const LEDGER = [
  {
    title: "Dispute opened",
    time: "Mar 6, 10:34",
    tone: "warning" as const,
    Icon: ShieldAlertIcon,
    body: "The customer disputed a renewal; finance has seven days.",
  },
  {
    title: "Payment captured",
    time: "Mar 6, 10:21",
    tone: "success" as const,
    Icon: CardIcon,
  },
  {
    title: "Payment authorised",
    time: "Mar 6, 10:21",
    tone: "default" as const,
    Icon: ShieldCheckIcon,
  },
  {
    title: "Invoice generated",
    time: "Mar 6, 10:20",
    tone: "default" as const,
    Icon: ReceiptIcon,
  },
];
function LedgerDemo() {
  return (
    <Timeline variant="compact" value={0} className="w-full">
      {LEDGER.map((entry, index) => (
        <Timeline.Item
          key={entry.title}
          step={index}
          tone={entry.tone}
          last={index === LEDGER.length - 1}
        >
          <Timeline.Indicator>
            <entry.Icon size={13} />
          </Timeline.Indicator>
          <Timeline.Content>
            <Timeline.Header>
              <Timeline.Title>{entry.title}</Timeline.Title>
              <Timeline.Trailing>{entry.time}</Timeline.Trailing>
            </Timeline.Header>
            {entry.body ? (
              <Timeline.Description>{entry.body}</Timeline.Description>
            ) : null}
          </Timeline.Content>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
const HANDOFF = [
  {
    time: "09:15",
    team: "Design",
    person: "Nina Park",
    tone: "default" as const,
    Icon: SendIcon,
    title: "Checkout copy approved",
    stats: [
      ["Screens", "18"],
      ["Open notes", "2"],
    ],
    body: "Invoice copy, empty states and seat-change messages passed.",
  },
  {
    time: "12:05",
    team: "Data",
    person: "Maya Hart",
    tone: "info" as const,
    Icon: ShareNodesIcon,
    title: "Metrics pipeline connected",
    stats: [
      ["Events", "12"],
      ["Lag", "42 s"],
    ],
    body: "Billing telemetry is flowing into the release dashboard.",
  },
  {
    time: "15:00",
    team: "Launch",
    person: "Eli Wong",
    tone: "success" as const,
    Icon: ShieldCheckIcon,
    title: "Checklist signed off",
    stats: [
      ["Checks", "9/9"],
      ["Window", "15 min"],
    ],
    body: "Rollback owner, dashboard links and launch channel are pinned.",
  },
];
function HandoffDemo() {
  return (
    <View className="w-full gap-4">
      <View className="items-center">
        <Text size="sm" muted>
          Launch review
        </Text>
        <Text size="xl" weight="semibold">
          Billing rollout
        </Text>
      </View>
      <Timeline variant="icon" value={HANDOFF.length - 1} className="w-full">
        {HANDOFF.map((entry, index) => (
          <Timeline.Item
            key={entry.title}
            step={index}
            tone={entry.tone}
            last={index === HANDOFF.length - 1}
          >
            <Timeline.Aside>
              <Timeline.Date>{entry.time}</Timeline.Date>
              <Timeline.Label>{entry.team}</Timeline.Label>
              <Timeline.Meta>{entry.person}</Timeline.Meta>
            </Timeline.Aside>
            <Timeline.Indicator>
              <entry.Icon size={15} />
            </Timeline.Indicator>
            <Timeline.Content>
              <Timeline.Title>{entry.title}</Timeline.Title>
              <Timeline.Stats>
                {entry.stats.map(([label, value]) => (
                  <Timeline.Stat key={label} label={label!} value={value!} />
                ))}
              </Timeline.Stats>
              <Timeline.Description>{entry.body}</Timeline.Description>
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
    </View>
  );
}
const TIMELINE_DATA = [
  { date: "Mar 12", title: "Order placed", body: "We received your order." },
  { date: "Mar 13", title: "Packed", body: "Your items left the warehouse." },
  { date: "Mar 15", title: "In transit", body: "Out with the courier." },
  { date: "Mar 17", title: "Delivered", body: "Left at the front door." },
];
function TimelineDemo({
  variant,
  value = 2,
}: {
  variant: "dot" | "icon" | "numbered" | "card";
  value?: number;
}) {
  return (
    <Timeline variant={variant} value={value} className="w-full">
      {TIMELINE_DATA.map((entry, index) => (
        <Timeline.Item
          key={entry.title}
          step={index}
          last={index === TIMELINE_DATA.length - 1}
        >
          <Timeline.Indicator>
            <CheckIcon size={14} />
          </Timeline.Indicator>
          <Timeline.Content>
            <Timeline.Header>
              <Timeline.Date>{entry.date}</Timeline.Date>
              <Timeline.Title>{entry.title}</Timeline.Title>
            </Timeline.Header>
            <Timeline.Description>{entry.body}</Timeline.Description>
          </Timeline.Content>
        </Timeline.Item>
      ))}
    </Timeline>
  );
}
function AppTile({
  letter,
  className,
}: {
  letter: string;
  className?: string;
}) {
  return (
    <View
      className={`border-background h-11 w-11 items-center justify-center rounded-2xl border-2 ${className}`}
    >
      <Text size="lg" weight="bold" className="text-white">
        {letter}
      </Text>
    </View>
  );
}
function MarkTile({ children }: { children: React.ReactNode }) {
  return (
    <View className="border-background h-11 w-11 items-center justify-center rounded-2xl border-2 bg-white">
      {children}
    </View>
  );
}
const LIFELINE: {
  year: string;
  label: string;
  title: string;
  mark: React.ReactNode;
  initials: string;
  events: string[];
}[] = [
  {
    year: "2016",
    label: "Started at",
    title: "Northgate",
    mark: <AppTile letter="N" className="bg-emerald-600" />,
    initials: "KA",
    events: ["First commit, on a train, in a single file."],
  },
  {
    year: "2017",
    label: "Shipped at",
    title: "Northgate",
    mark: <AppTile letter="N" className="bg-emerald-600" />,
    initials: "KA",
    events: [
      "Rewrote the layout engine after the first real app hit sixty screens.",
      "Ten components, all of them buttons in disguise.",
    ],
  },
  {
    year: "2018",
    label: "Quiet year at",
    title: "Northgate",
    mark: <AppTile letter="N" className="bg-emerald-600" />,
    initials: "KA",
    events: [],
  },
  {
    year: "2019",
    label: "Joined",
    title: "Apple",
    mark: (
      <MarkTile>
        <AppleIcon size={20} color="#000000" />
      </MarkTile>
    ),
    initials: "KA",
    events: [
      "Moved the animations onto the UI thread and stopped apologising for the list.",
    ],
  },
  {
    year: "2020",
    label: "Still at",
    title: "Apple",
    mark: (
      <MarkTile>
        <AppleIcon size={20} color="#000000" />
      </MarkTile>
    ),
    initials: "KA",
    events: [],
  },
  {
    year: "2021",
    label: "Still at",
    title: "Apple",
    mark: (
      <MarkTile>
        <AppleIcon size={20} color="#000000" />
      </MarkTile>
    ),
    initials: "KA",
    events: [],
  },
  {
    year: "2022",
    label: "Joined",
    title: "Google",
    mark: (
      <MarkTile>
        <GoogleIcon size={20} />
      </MarkTile>
    ),
    initials: "KA",
    events: [
      "Design tokens became one file, and dark mode stopped being a fork.",
      "The docs started generating themselves from the source.",
    ],
  },
  {
    year: "2023",
    label: "Shipped at",
    title: "Google",
    mark: (
      <MarkTile>
        <GoogleIcon size={20} />
      </MarkTile>
    ),
    initials: "KA",
    events: ["Charts arrived — twelve of them, all on one scale engine."],
  },
  {
    year: "2024",
    label: "Quiet year at",
    title: "Google",
    mark: (
      <MarkTile>
        <GoogleIcon size={20} />
      </MarkTile>
    ),
    initials: "KA",
    events: [],
  },
  {
    year: "2025",
    label: "Left for",
    title: "PanelUI",
    mark: <AppTile letter="P" className="bg-indigo-600" />,
    initials: "KA",
    events: [
      "The registry shipped, so a component could be copied instead of installed.",
    ],
  },
];
function LifelineDemo() {
  const [active, setActive] = useState(0);
  const entry = LIFELINE[active] ?? LIFELINE[0]!;
  return (
    <View className="flex-1 justify-center">
      <Timeline.Masthead
        className="px-5 pb-8"
        media={
          <>
            <View className="border-background bg-secondary h-11 w-11 items-center justify-center rounded-2xl border-2">
              <Text size="sm" weight="semibold">
                {entry.initials}
              </Text>
            </View>
            <View className="-ms-3">{entry.mark}</View>
          </>
        }
        label={entry.label}
        title={entry.title}
      />

      <Timeline
        orientation="horizontal"
        haptics
        value={LIFELINE.length - 1}
        onColumnChange={setActive}
        className="pl-5"
      >
        {LIFELINE.map((item, index) => (
          <Timeline.Item
            key={item.year}
            step={index}
            last={index === LIFELINE.length - 1}
          >
            <Timeline.Indicator />
            <Timeline.Content>
              {item.events.map((event) => (
                <Timeline.Description key={event} className="pb-3">
                  {event}
                </Timeline.Description>
              ))}
            </Timeline.Content>
          </Timeline.Item>
        ))}
      </Timeline>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "timeline",
  name: "Timeline",
  summary: "Vertical sequence of events",
  demos: [
    { label: "Dot", render: () => <TimelineDemo variant="dot" /> },
    { label: "Icon", render: () => <TimelineDemo variant="icon" /> },
    { label: "Numbered", render: () => <TimelineDemo variant="numbered" /> },
    { label: "Card", render: () => <TimelineDemo variant="card" /> },
    { label: "Deploy log", render: () => <DeployLogDemo /> },
    { label: "Studio feed", render: () => <StudioFeedDemo /> },
    { label: "Ledger", render: () => <LedgerDemo /> },
    { label: "Handoff", render: () => <HandoffDemo /> },
    {
      label: "A working life, sideways",
      id: "horizontal",
      fullPage: true,
      description:
        "Stops as columns on a rail wider than the screen, with a masthead that follows the drag.",
      render: () => <LifelineDemo />,
    },
  ],
};
