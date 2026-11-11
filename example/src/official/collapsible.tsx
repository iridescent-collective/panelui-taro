import { Button } from "panelui-taro/button";
import {
  Collapsible,
  type CollapsibleVariant,
} from "panelui-taro/collapsible";
import { Text } from "panelui-taro/primitives/text";
import { Textarea } from "panelui-taro/textarea";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function CollapsibleDemo({ variant }: { variant: CollapsibleVariant }) {
  return (
    <Collapsible variant={variant} defaultOpen className="w-full">
      <Collapsible.Trigger>
        <Collapsible.Title>What is included</Collapsible.Title>
        <Collapsible.Indicator />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Text size="sm" muted>
          Unlimited projects, 100GB of storage, and email support.
        </Text>
      </Collapsible.Content>
    </Collapsible>
  );
}
function CollapsibleControlledDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View className="w-full gap-3">
      <Button variant="outline" onPress={() => setOpen((current) => !current)}>
        {open ? "Close it from out here" : "Open it from out here"}
      </Button>

      <Collapsible
        variant="surface"
        open={open}
        onOpenChange={setOpen}
        className="w-full"
      >
        <Collapsible.Trigger>
          <Collapsible.Title>Billing details</Collapsible.Title>
          <Collapsible.Indicator />
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Text size="sm" muted>
            Billed monthly, cancel any time.
          </Text>
        </Collapsible.Content>
      </Collapsible>
    </View>
  );
}
function CollapsibleStateDemo() {
  return (
    <View className="w-full gap-3">
      <Collapsible variant="surface" className="w-full">
        <Collapsible.Trigger>
          <Collapsible.Title>Delivery note</Collapsible.Title>
          <Collapsible.Indicator />
        </Collapsible.Trigger>
        <Collapsible.Content>
          <Textarea placeholder="Leave it with a neighbour…" />
        </Collapsible.Content>
      </Collapsible>

      <Text size="xs" muted>
        Type into the field, close the section, then open it again.
      </Text>
    </View>
  );
}
function CollapsibleDisabledDemo() {
  return (
    <Collapsible variant="surface" isDisabled className="w-full">
      <Collapsible.Trigger>
        <Collapsible.Title>Enterprise billing</Collapsible.Title>
        <Collapsible.Indicator />
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Text size="sm" muted>
          Contact sales.
        </Text>
      </Collapsible.Content>
    </Collapsible>
  );
}
export const entry: ComponentEntry = {
  slug: "collapsible",
  name: "Collapsible",
  summary: "One section, shown and hidden by its own header",
  demos: [
    { label: "Default", render: () => <CollapsibleDemo variant="default" /> },
    { label: "Surface", render: () => <CollapsibleDemo variant="surface" /> },
    { label: "Ghost", render: () => <CollapsibleDemo variant="ghost" /> },
    { label: "Controlled", render: () => <CollapsibleControlledDemo /> },
    {
      label: "The body keeps its state",
      render: () => <CollapsibleStateDemo />,
    },
    { label: "Disabled", render: () => <CollapsibleDisabledDemo /> },
  ],
};
