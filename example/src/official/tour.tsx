import { Avatar } from "panelui-taro/avatar";
import { Badge } from "panelui-taro/badge";
import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import {
  BookmarkIcon,
  BellIcon,
  PlusIcon,
  SearchIcon,
} from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { Switch } from "panelui-taro/switch";
import { Tour } from "panelui-taro/tour";
import { useRef, useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { useSafeAreaInsets } from "../runtime/native";
import { ScrollView, View, type LayoutChangeEvent } from "../runtime/native";
import { ComponentEntry } from "../types";
function TourDemo() {
  const [running, setRunning] = useState(false);
  return (
    <View className="w-full gap-4">
      <Tour open={running} onOpenChange={setRunning}>
        <View className="flex-row items-center justify-between">
          <Text weight="semibold">Inbox</Text>
          <Tour.Step
            order={1}
            title="Filter what you see"
            description="Unread, flagged, or everything at once."
            shape="circle"
          >
            <Button
              variant="ghost"
              size="icon"
              accessibilityLabel="Filter"
              onPress={demoAction("Filter")}
            >
              <SearchIcon size={20} />
            </Button>
          </Tour.Step>
        </View>

        <Tour.Step
          order={0}
          title="Your conversations"
          description="Everything waiting for a reply lands in this list."
          radius={16}
        >
          <Card>
            <Card.Content className="gap-2 p-4">
              {[
                { name: "Ana Ruiz", initials: "AR" },
                { name: "Deploy bot", initials: "DB" },
                { name: "Marta Silva", initials: "MS" },
              ].map((person) => (
                <View key={person.name} className="flex-row items-center gap-3">
                  <Avatar size="sm" fallback={person.initials} />
                  <Text size="sm">{person.name}</Text>
                </View>
              ))}
            </Card.Content>
          </Card>
        </Tour.Step>

        <Tour.Step
          order={2}
          title="Start something new"
          description="A message to anyone, from anywhere in the app."
        >
          <Button onPress={demoAction("New message")}>New message</Button>
        </Tour.Step>
      </Tour>

      <Button variant="outline" onPress={() => setRunning(true)}>
        Start the tour
      </Button>
    </View>
  );
}
function TourCircleDemo() {
  const [running, setRunning] = useState(false);
  return (
    <View className="w-full gap-4">
      <Tour
        open={running}
        onOpenChange={setRunning}
        shape="circle"
        padding={10}
      >
        <View className="flex-row items-center justify-center gap-6">
          <Tour.Step
            order={0}
            title="You"
            description="Your profile, and everything under it."
          >
            <Avatar fallback="KA" />
          </Tour.Step>
          <Tour.Step
            order={1}
            title="What you saved"
            description="Anything you bookmark shows up here."
          >
            <Button
              variant="secondary"
              size="icon"
              accessibilityLabel="Saved"
              onPress={demoAction("Saved")}
            >
              <BookmarkIcon size={20} />
            </Button>
          </Tour.Step>
          <Tour.Step
            order={2}
            title="Alerts"
            description="What the app is allowed to interrupt you for."
          >
            <Button
              variant="secondary"
              size="icon"
              accessibilityLabel="Alerts"
              onPress={demoAction("Alerts")}
            >
              <BellIcon size={20} />
            </Button>
          </Tour.Step>
        </View>
      </Tour>

      <Button variant="outline" onPress={() => setRunning(true)}>
        Start the tour
      </Button>
    </View>
  );
}
function TourInteractiveDemo() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);
  return (
    <View className="w-full gap-4">
      <Tour
        open={running}
        onOpenChange={setRunning}
        step={step}
        onStepChange={setStep}
        interactive
        showSkip={false}
      >
        <View className="items-center gap-4">
          <Tour.Step
            order={0}
            title="Press it"
            description="Go on — the button still works under the dim."
            shape="circle"
          >
            <Button
              variant="primary"
              size="icon"
              accessibilityLabel="Add one"
              onPress={() => {
                setCount((current) => current + 1);
                if (running && step === 0) setStep(1);
              }}
            >
              <PlusIcon size={20} />
            </Button>
          </Tour.Step>

          <Tour.Step
            order={1}
            title="And there it is"
            description="The count went up by one."
          >
            <Text size="lg" weight="semibold">
              {count}
            </Text>
          </Tour.Step>
        </View>
      </Tour>

      <Button
        variant="outline"
        onPress={() => {
          setStep(0);
          setRunning(true);
        }}
      >
        Start the tour
      </Button>
    </View>
  );
}
function TourScrollingDemo() {
  const [running, setRunning] = useState(false);
  const scroller = useRef<import("../runtime/native").NativeScrollHandle>(null);
  const insets = useSafeAreaInsets();
  const offsets = useRef<Record<number, number>>({});
  const remember = (order: number) => (event: LayoutChangeEvent) => {
    offsets.current[order] = event.nativeEvent.layout.y;
  };
  return (
    <View className="flex-1">
      <Tour
        open={running}
        onOpenChange={setRunning}
        onStepChange={(order) => {
          const y = offsets.current[order];
          if (y === undefined) return;
          scroller.current?.scrollTo({
            y: Math.max(0, y - 96),
            animated: false,
          });
        }}
      >
        <ScrollView
          ref={scroller}
          contentContainerStyle={{
            padding: 20,
            paddingBottom: insets.bottom + 120,
            gap: 16,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text size="xl" weight="bold">
            Workspace
          </Text>

          <Tour.Step
            order={0}
            title="Everyone in here"
            description="Who has access, and what they can reach."
            radius={16}
          >
            <Card>
              <Card.Content className="gap-3 p-4">
                {[
                  { name: "Ana Ruiz", role: "Admin", initials: "AR" },
                  { name: "Marta Silva", role: "Editor", initials: "MS" },
                  { name: "Tom Byrne", role: "Viewer", initials: "TB" },
                ].map((person) => (
                  <View
                    key={person.name}
                    className="flex-row items-center gap-3"
                  >
                    <Avatar size="sm" fallback={person.initials} />
                    <Text size="sm" className="flex-1">
                      {person.name}
                    </Text>
                    <Badge variant="secondary">{person.role}</Badge>
                  </View>
                ))}
              </Card.Content>
            </Card>
          </Tour.Step>

          <Filler lines={7} />

          <Tour.Step
            order={1}
            title="What gets sent"
            description="Turn off anything you would rather not hear about."
            radius={16}
          >
            <Card>
              <Card.Content className="gap-4 p-4">
                <Text weight="semibold">Notifications</Text>
                <NotificationRow label="Mentions" initial />
                <NotificationRow label="Weekly digest" />
              </Card.Content>
            </Card>
          </Tour.Step>

          <Filler lines={9} />

          <Tour.Step
            order={2}
            title="The one that cannot be undone"
            description="Right at the bottom, where it belongs."
          >
            <Button
              variant="destructive"
              onPress={demoAction("Delete workspace")}
            >
              Delete workspace
            </Button>
          </Tour.Step>
        </ScrollView>
      </Tour>

      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 bottom-0 px-5"
        style={{ paddingBottom: insets.bottom + 20 }}
      >
        <Button onPress={() => setRunning(true)}>Start the walkthrough</Button>
      </View>
    </View>
  );
}
function NotificationRow({
  label,
  initial = false,
}: {
  label: string;
  initial?: boolean;
}) {
  const [on, setOn] = useState(initial);
  return (
    <View className="flex-row items-center justify-between gap-4">
      <Text size="sm" className="flex-1">
        {label}
      </Text>
      <Switch value={on} onValueChange={setOn} />
    </View>
  );
}
function Filler({ lines }: { lines: number }) {
  return (
    <View className="gap-2">
      {Array.from({ length: lines }, (_, index) => (
        <View
          key={index}
          className="bg-muted h-3 rounded-full"
          style={{ width: `${68 + ((index * 37) % 30)}%` }}
        />
      ))}
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "tour",
  name: "Tour",
  summary: "A walkthrough that introduces a screen one control at a time",
  demos: [
    { label: "A walkthrough", render: () => <TourDemo /> },
    { label: "Round targets", render: () => <TourCircleDemo /> },
    { label: "Try it yourself", render: () => <TourInteractiveDemo /> },
    {
      label: "Across a scroll",
      id: "scrolling",
      fullPage: true,
      description:
        "A screen taller than the screen: each step scrolls its target back into view first.",
      render: () => <TourScrollingDemo />,
    },
  ],
};
