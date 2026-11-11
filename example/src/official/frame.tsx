import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { Chip } from "panelui-taro/chip";
import { Frame } from "panelui-taro/frame";
import { Text } from "panelui-taro/primitives/text";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function FrameRing({ percent }: { percent: number }) {
  return (
    <View className="border-muted h-6 w-6 items-center justify-center rounded-full border-2">
      <View
        className="border-t-info absolute h-6 w-6 rounded-full border-2 border-transparent"
        style={{ transform: [{ rotate: `${(percent / 100) * 360}deg` }] }}
      />
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "frame",
  name: "Frame",
  summary: "Widget shell with a titled header and a flush inner card",
  layout: "sections",
  demos: [
    {
      label: "Agent monitor",
      render: () => (
        <Frame className="w-full">
          <Frame.Header>
            <Frame.Title>Agent monitor</Frame.Title>
            <Frame.Action>All agents under 25% token limit</Frame.Action>
          </Frame.Header>
          <Frame.Panel>
            {[
              [
                "GPT 5.6 Sol",
                "UX research for fintech trends",
                "Done",
                "10m7s",
              ],
              [
                "Fable 5",
                "Planning out the app user flow",
                "Running",
                "15m12s",
              ],
              [
                "GPT 5.6 Sol",
                "Building out the UI design system",
                "Running",
                "15m12s",
              ],
              ["Haiku 4.5", "On standby", "Idle", "0s"],
            ].map(([model, task, status, elapsed]) => (
              <Frame.Row key={task}>
                <Frame.Content>
                  <Frame.Title>{model}</Frame.Title>
                  <Frame.Description>{task}</Frame.Description>
                </Frame.Content>
                <Frame.Actions>
                  <Chip
                    size="sm"
                    variant={
                      status === "Running"
                        ? "success"
                        : status === "Done"
                          ? "outline"
                          : "default"
                    }
                  >
                    {status}
                  </Chip>
                  <Text size="xs" muted>
                    {elapsed}
                  </Text>
                </Frame.Actions>
              </Frame.Row>
            ))}
          </Frame.Panel>
        </Frame>
      ),
    },
    {
      label: "A single row",
      render: () => (
        <Frame className="w-full">
          <Frame.Header>
            <Frame.Title>Agent monitor</Frame.Title>
            <Frame.Action>25% token limit</Frame.Action>
          </Frame.Header>
          <Frame.Panel>
            <Frame.Row wrap className="gap-2">
              <Chip size="sm" variant="success">
                2 Running
              </Chip>
              <Chip size="sm">1 Idle</Chip>
              <Chip size="sm" variant="outline">
                1 Done
              </Chip>
              <Frame.Actions className="ml-auto">
                <Text size="xs" muted>
                  15m12s ago
                </Text>
              </Frame.Actions>
            </Frame.Row>
          </Frame.Panel>
        </Frame>
      ),
    },
    {
      label: "Usage summary",
      render: () => (
        <Frame className="w-full">
          <Frame.Header>
            <Frame.Title>Usage Type</Frame.Title>
            <Frame.Action>Amount</Frame.Action>
          </Frame.Header>
          <Frame.Panel>
            {[
              ["Total API Requests", "33.1K", 25],
              ["Input Tokens", "98.2M", 70],
              ["Output Tokens", "59M", 45],
              ["Total Spend", "$149.61", 85],
            ].map(([label, value, pct]) => (
              <Frame.Row key={label as string}>
                <Frame.Media>
                  <FrameRing percent={pct as number} />
                </Frame.Media>
                <Frame.Content>
                  <Text numberOfLines={1}>{label}</Text>
                </Frame.Content>
                <Frame.Actions>
                  <Text weight="medium">{value}</Text>
                </Frame.Actions>
              </Frame.Row>
            ))}
          </Frame.Panel>
        </Frame>
      ),
    },
    {
      label: "Member list",
      render: () => (
        <Frame className="w-full">
          <Frame.Header>
            <Frame.Title>Team members</Frame.Title>
            <Frame.Action>
              <Badge variant="secondary">3</Badge>
            </Frame.Action>
          </Frame.Header>
          <Frame.Panel>
            {[
              ["KA", "Khalid Abdi", "khalid@example.com", "Owner"],
              ["JD", "Jamie Doe", "jamie@example.com", "Editor"],
              ["SM", "Sam Miller", "sam@example.com", "Viewer"],
            ].map(([initials, name, email, role]) => (
              <Frame.Row key={email}>
                <Frame.Media>
                  <Avatar size="sm" fallback={initials} />
                </Frame.Media>
                <Frame.Content>
                  <Frame.Title>{name}</Frame.Title>
                  <Frame.Description>{email}</Frame.Description>
                </Frame.Content>
                <Frame.Actions>
                  <Badge variant="outline">{role}</Badge>
                </Frame.Actions>
              </Frame.Row>
            ))}
          </Frame.Panel>
        </Frame>
      ),
    },
    {
      label: "Settings group",
      render: () => (
        <Frame className="w-full">
          <Frame.Header>
            <Frame.Title>Preferences</Frame.Title>
            <Frame.Action>Edit</Frame.Action>
          </Frame.Header>
          <Frame.Panel>
            {[
              ["Language", "English"],
              ["Region", "United States"],
              ["Time zone", "GMT+3"],
            ].map(([label, value]) => (
              <Frame.Row key={label}>
                <Text size="sm" className="flex-1">
                  {label}
                </Text>
                <Text size="sm" muted>
                  {value}
                </Text>
              </Frame.Row>
            ))}
          </Frame.Panel>
        </Frame>
      ),
    },
    {
      label: "A row that would not fit",
      render: () => (
        <Frame className="w-full">
          <Frame.Header>
            <Frame.Title>
              Deployment history for the production environment
            </Frame.Title>
            <Frame.Action>Last 7 days</Frame.Action>
          </Frame.Header>
          <Frame.Panel>
            <Frame.Row align="start">
              <Frame.Media>
                <Avatar size="sm" fallback="KA" />
              </Frame.Media>
              <Frame.Content>
                <Frame.Title>
                  feat(registry): resolve relative imports through the alias
                  table
                </Frame.Title>
                <Frame.Description>
                  Deployed to production from the main branch about two hours
                  ago, after the full test suite passed on every workspace.
                </Frame.Description>
              </Frame.Content>
              <Frame.Actions>
                <Chip size="sm" variant="success">
                  Live
                </Chip>
                <Chip size="sm" variant="outline">
                  2h
                </Chip>
              </Frame.Actions>
            </Frame.Row>
            <Frame.Row align="start">
              <Frame.Media>
                <Avatar size="sm" fallback="JD" />
              </Frame.Media>
              <Frame.Content>
                <Frame.Title>
                  fix(bottom-sheet): restore the bottom border
                </Frame.Title>
                <Frame.Description>
                  Rolled back after an hour — the detached sheet lost its bottom
                  edge on devices without a home indicator.
                </Frame.Description>
              </Frame.Content>
              <Frame.Actions>
                <Chip size="sm">Rolled back</Chip>
              </Frame.Actions>
            </Frame.Row>
          </Frame.Panel>
        </Frame>
      ),
    },
    {
      label: "Rows that lead somewhere",
      render: () => (
        <Frame className="w-full">
          <Frame.Header>
            <Frame.Title>Account</Frame.Title>
          </Frame.Header>
          <Frame.Panel>
            {["Profile", "Notifications", "Connected apps"].map((label) => (
              <Frame.Row
                key={label}
                chevron
                onPress={demoAction("Frame Row selected")}
              >
                <Text size="sm" className="flex-1">
                  {label}
                </Text>
              </Frame.Row>
            ))}
          </Frame.Panel>
        </Frame>
      ),
    },
    {
      label: "Sections",
      render: () => (
        <Frame className="w-full">
          <Frame.Header>
            <Frame.Title>Workspace</Frame.Title>
            <Frame.Action>Manage</Frame.Action>
          </Frame.Header>
          <Frame.Panel>
            <Frame.Section title="General">
              <Frame.Row>
                <Text size="sm" className="flex-1">
                  Name
                </Text>
                <Text size="sm" muted>
                  Acme
                </Text>
              </Frame.Row>
              <Frame.Row>
                <Text size="sm" className="flex-1">
                  Plan
                </Text>
                <Badge variant="secondary">Pro</Badge>
              </Frame.Row>
            </Frame.Section>
            <Frame.Section title="Danger zone">
              <Frame.Row chevron onPress={demoAction("Delete workspace")}>
                <Text size="sm" className="text-destructive flex-1">
                  Delete workspace
                </Text>
              </Frame.Row>
            </Frame.Section>
          </Frame.Panel>
        </Frame>
      ),
    },
    {
      label: "Inset, the well and the band",
      render: () => (
        <Frame variant="inset" className="w-full">
          <Frame.Panel>
            {[
              ["JD", "Jamie Doe", "jamie@example.com", "Editor"],
              ["SM", "Sam Miller", "sam@example.com", "Viewer"],
            ].map(([initials, name, email, role]) => (
              <Frame.Row key={email}>
                <Frame.Media>
                  <Avatar size="sm" fallback={initials} />
                </Frame.Media>
                <Frame.Content>
                  <Frame.Title>{name}</Frame.Title>
                  <Frame.Description>{email}</Frame.Description>
                </Frame.Content>
                <Frame.Actions>
                  <Badge variant="outline">{role}</Badge>
                </Frame.Actions>
              </Frame.Row>
            ))}
          </Frame.Panel>
          <Frame.Footer>
            <Button variant="secondary" onPress={demoAction("Decline all")}>
              Decline all
            </Button>
            <Button onPress={demoAction("Accept all")}>Accept all</Button>
          </Frame.Footer>
        </Frame>
      ),
    },
    {
      label: "Inset, with a header in the band",
      render: () => (
        <Frame variant="inset" className="w-full">
          <Frame.Header>
            <Frame.Title>Usage this month</Frame.Title>
            <Frame.Action>Aug 1 – Aug 31</Frame.Action>
          </Frame.Header>
          <Frame.Panel>
            {[
              ["Requests", "33.1K"],
              ["Input tokens", "98.2M"],
              ["Output tokens", "59M"],
            ].map(([label, value]) => (
              <Frame.Row key={label}>
                <Text size="sm" className="flex-1">
                  {label}
                </Text>
                <Text size="sm" weight="medium">
                  {value}
                </Text>
              </Frame.Row>
            ))}
          </Frame.Panel>
          <Frame.Footer>
            <Button variant="secondary" onPress={demoAction("Export")}>
              Export
            </Button>
          </Frame.Footer>
        </Frame>
      ),
    },
    {
      label: "Plain, inside a card",
      render: () => (
        <Card className="w-full">
          <Card.Content className="p-4">
            <Frame variant="plain">
              <Frame.Panel>
                {[
                  ["Requests", "12.4K"],
                  ["Errors", "38"],
                ].map(([label, value]) => (
                  <Frame.Row key={label}>
                    <Text size="sm" className="flex-1">
                      {label}
                    </Text>
                    <Text size="sm" weight="medium">
                      {value}
                    </Text>
                  </Frame.Row>
                ))}
              </Frame.Panel>
            </Frame>
          </Card.Content>
        </Card>
      ),
    },
  ],
};
