import { Button } from "panelui-taro/button";
import { Frame } from "panelui-taro/frame";
import { Label } from "panelui-taro/label";
import { Text } from "panelui-taro/primitives/text";
import { ProgressButton } from "panelui-taro/progress-button";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function ProgressButtonDemo() {
  const [wiped, setWiped] = useState(0);
  return (
    <View className="w-full gap-3">
      <ProgressButton
        variant="destructive"
        haptics
        autoReset
        fullWidth
        onComplete={() => setWiped((count) => count + 1)}
      >
        <ProgressButton.Label>Hold to erase</ProgressButton.Label>
      </ProgressButton>
      <Text size="sm" muted>
        {wiped === 0
          ? "Nothing erased yet"
          : `Erased ${wiped} time${wiped === 1 ? "" : "s"}`}
      </Text>
    </View>
  );
}
function ProgressButtonPayDemo() {
  const [paid, setPaid] = useState(false);
  return (
    <Frame className="w-full">
      <Frame.Header>
        <Frame.Title>Checkout</Frame.Title>
        <Frame.Action>Delivered Thursday</Frame.Action>
      </Frame.Header>

      <Frame.Panel>
        <Frame.Row>
          <Frame.Content>
            <Frame.Title>Kettle</Frame.Title>
            <Frame.Description>Matte black</Frame.Description>
          </Frame.Content>
          <Frame.Actions>
            <Text size="sm">£34.00</Text>
          </Frame.Actions>
        </Frame.Row>
        <Frame.Row>
          <Frame.Content>
            <Frame.Title>Delivery</Frame.Title>
            <Frame.Description>Before noon</Frame.Description>
          </Frame.Content>
          <Frame.Actions>
            <Text size="sm">£8.60</Text>
          </Frame.Actions>
        </Frame.Row>
        <Frame.Row>
          <Frame.Content>
            <Frame.Title>Total</Frame.Title>
          </Frame.Content>
          <Frame.Actions>
            <Text size="base" weight="semibold">
              £42.60
            </Text>
          </Frame.Actions>
        </Frame.Row>
      </Frame.Panel>

      <View className="px-4 pt-3 pb-3">
        <ProgressButton
          variant="success"
          haptics
          fullWidth
          completed={paid}
          onComplete={() => setPaid(true)}
          onCompletedChange={setPaid}
        >
          <ProgressButton.Label>
            {paid ? "Paid" : "Hold to pay"}
          </ProgressButton.Label>
        </ProgressButton>
      </View>
    </Frame>
  );
}
export const entry: ComponentEntry = {
  slug: "progress-button",
  name: "ProgressButton",
  summary: "Press and hold to confirm, with the wait drawn on the button",
  demos: [
    { label: "Hold to confirm", render: () => <ProgressButtonDemo /> },
    { label: "Hold to pay", render: () => <ProgressButtonPayDemo /> },
    {
      label: "The shape of an ordinary button",
      render: () => (
        <View className="w-full gap-3">
          <ProgressButton
            shape="rounded"
            autoReset
            fullWidth
            onComplete={() => {}}
          >
            <ProgressButton.Label>Hold to delete</ProgressButton.Label>
          </ProgressButton>
          <Button variant="outline" fullWidth onPress={demoAction("Cancel")}>
            Cancel
          </Button>
        </View>
      ),
    },
    {
      label: "Variants",
      render: () => (
        <View className="w-full gap-3">
          <ProgressButton autoReset fullWidth onComplete={() => {}}>
            <ProgressButton.Label>primary</ProgressButton.Label>
          </ProgressButton>
          <ProgressButton
            variant="destructive"
            autoReset
            fullWidth
            onComplete={() => {}}
          >
            <ProgressButton.Label>destructive</ProgressButton.Label>
          </ProgressButton>
          <ProgressButton
            variant="success"
            autoReset
            fullWidth
            onComplete={() => {}}
          >
            <ProgressButton.Label>success</ProgressButton.Label>
          </ProgressButton>
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full items-start gap-3">
          <ProgressButton size="sm" autoReset onComplete={() => {}}>
            <ProgressButton.Label>Small</ProgressButton.Label>
          </ProgressButton>
          <ProgressButton size="md" autoReset onComplete={() => {}}>
            <ProgressButton.Label>Medium</ProgressButton.Label>
          </ProgressButton>
          <ProgressButton size="lg" autoReset onComplete={() => {}}>
            <ProgressButton.Label>Large</ProgressButton.Label>
          </ProgressButton>
        </View>
      ),
    },
    {
      label: "How long the hold is",
      render: () => (
        <View className="w-full gap-3">
          <ProgressButton
            holdDuration={600}
            autoReset
            fullWidth
            onComplete={() => {}}
          >
            <ProgressButton.Label>
              Six hundred milliseconds
            </ProgressButton.Label>
          </ProgressButton>
          <ProgressButton
            holdDuration={3500}
            autoReset
            fullWidth
            onComplete={() => {}}
          >
            <ProgressButton.Label>
              Three and a half seconds
            </ProgressButton.Label>
          </ProgressButton>
        </View>
      ),
    },
    {
      label: "Disabled",
      render: () => (
        <ProgressButton disabled fullWidth onComplete={() => {}}>
          <ProgressButton.Label>Nothing to confirm</ProgressButton.Label>
        </ProgressButton>
      ),
    },
  ],
};
