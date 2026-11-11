import { Button } from "panelui-taro/button";
import { InfoIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { Tooltip } from "panelui-taro/tooltip";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function PlacementTooltip({
  placement,
}: {
  placement: "top" | "bottom" | "left" | "right";
}) {
  return (
    <Tooltip openOn="press" duration={0}>
      <Tooltip.Trigger>
        <Button variant="secondary" size="sm">
          {placement}
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content placement={placement}>
        <Tooltip.Arrow />
        Opens {placement}
      </Tooltip.Content>
    </Tooltip>
  );
}
export const entry: ComponentEntry = {
  slug: "tooltip",
  name: "Tooltip",
  summary: "A small label that names the thing under your finger",
  demos: [
    {
      label: "Long press",
      render: () => (
        <Tooltip label="Copy link">
          <Tooltip.Trigger>
            <Button variant="outline">Press and hold</Button>
          </Tooltip.Trigger>
          <Tooltip.Content>
            <Tooltip.Arrow />
            Copy link
          </Tooltip.Content>
        </Tooltip>
      ),
    },
    {
      label: "On press",
      render: () => (
        <View className="flex-row items-center gap-3">
          <Tooltip openOn="press" label="More information">
            <Tooltip.Trigger>
              <Button variant="ghost" size="icon" accessibilityLabel="Info">
                <InfoIcon size={20} />
              </Button>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <Tooltip.Arrow />
              Syncs every 15 minutes
            </Tooltip.Content>
          </Tooltip>
          <Text size="sm" muted>
            Tap the icon
          </Text>
        </View>
      ),
    },
    {
      label: "Placement",
      render: () => (
        <View className="h-64 w-full justify-between py-4">
          <View className="flex-row justify-center">
            <PlacementTooltip placement="bottom" />
          </View>
          <View className="flex-row justify-between px-2">
            <PlacementTooltip placement="right" />
            <PlacementTooltip placement="left" />
          </View>
          <View className="flex-row justify-center">
            <PlacementTooltip placement="top" />
          </View>
        </View>
      ),
    },
    {
      label: "Rich content",
      render: () => (
        <Tooltip openOn="press" duration={0}>
          <Tooltip.Trigger>
            <Button variant="secondary">Keyboard shortcut</Button>
          </Tooltip.Trigger>
          <Tooltip.Content className="flex-row items-center gap-2">
            <Tooltip.Arrow />
            <Tooltip.Text>Save</Tooltip.Text>
            <View className="bg-background/20 rounded px-1.5 py-0.5">
              <Text size="xs" weight="semibold" className="text-background">
                ⌘S
              </Text>
            </View>
          </Tooltip.Content>
        </Tooltip>
      ),
    },
    {
      label: "A panel, not a label",
      render: () => (
        <Tooltip openOn="press" duration={0}>
          <Tooltip.Trigger>
            <Button variant="outline">What is streaming?</Button>
          </Tooltip.Trigger>
          <Tooltip.Content variant="surface" width={264} className="gap-1 p-3">
            <Tooltip.Arrow />
            <Tooltip.Title>Streaming</Tooltip.Title>
            <Tooltip.Description>
              Tokens are rendered as they arrive rather than waiting for the
              whole reply, so the first words appear in a few hundred
              milliseconds.
            </Tooltip.Description>
          </Tooltip.Content>
        </Tooltip>
      ),
    },
    {
      label: "Scrolled, when it has to be",
      render: () => (
        <Tooltip openOn="press" duration={0}>
          <Tooltip.Trigger>
            <Button variant="outline">Release notes</Button>
          </Tooltip.Trigger>
          <Tooltip.Content
            variant="surface"
            width={280}
            maxHeight={220}
            scrollable
            className="p-3"
          >
            <View className="gap-2">
              <Tooltip.Title>What changed in 0.30</Tooltip.Title>
              {[
                "Textarea, sized in rows rather than pixels.",
                "The menu panel draws on a replaceable background layer.",
                "Tooltips follow the theme, and hold a panel of content.",
                "The calendar frames itself and draws a continuous range.",
                "Reasoning, Sources, Task, CodeBlock and Plan.",
              ].map((line) => (
                <Tooltip.Description key={line}>{line}</Tooltip.Description>
              ))}
            </View>
          </Tooltip.Content>
        </Tooltip>
      ),
    },
  ],
};
