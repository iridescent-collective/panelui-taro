import { Button } from "panelui-taro/button";
import { UnlockIcon } from "panelui-taro/icons";
import { Label } from "panelui-taro/label";
import { SlideButton } from "panelui-taro/slide-button";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function SlideButtonDemo() {
  const [shipped, setShipped] = useState(false);
  return (
    <View className="w-full gap-3">
      <SlideButton
        fullWidth
        completed={shipped}
        onComplete={() => setShipped(true)}
      >
        <SlideButton.Label>
          {shipped ? "Shipped" : "Slide to ship"}
        </SlideButton.Label>
      </SlideButton>
      <Button variant="secondary" onPress={() => setShipped(false)}>
        Reset
      </Button>
    </View>
  );
}
function SlideButtonPendingDemo() {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  return (
    <View className="w-full gap-3">
      <SlideButton
        fullWidth
        completed={state !== "idle"}
        onComplete={() => {
          setState("sending");
          setTimeout(() => setState("sent"), 1400);
        }}
      >
        <SlideButton.Label>
          {state === "idle"
            ? "Slide to transfer $240"
            : state === "sending"
              ? "Sending…"
              : "Sent"}
        </SlideButton.Label>
      </SlideButton>
      <Button variant="secondary" onPress={() => setState("idle")}>
        Reset
      </Button>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "slide-button",
  name: "SlideButton",
  summary: "Drag across to confirm, with the distance drawn on the button",
  demos: [
    { label: "Slide to confirm", render: () => <SlideButtonDemo /> },
    {
      label: "Waiting on the server",
      render: () => <SlideButtonPendingDemo />,
    },
    {
      label: "Variants",
      render: () => (
        <View className="w-full gap-3">
          <SlideButton autoReset fullWidth onComplete={() => {}}>
            <SlideButton.Label>secondary</SlideButton.Label>
          </SlideButton>
          <SlideButton
            variant="destructive"
            autoReset
            fullWidth
            onComplete={() => {}}
          >
            <SlideButton.Label>destructive</SlideButton.Label>
          </SlideButton>
          <SlideButton
            variant="success"
            autoReset
            fullWidth
            onComplete={() => {}}
          >
            <SlideButton.Label>success</SlideButton.Label>
          </SlideButton>
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-3">
          <SlideButton size="sm" autoReset fullWidth onComplete={() => {}}>
            <SlideButton.Label>Small</SlideButton.Label>
          </SlideButton>
          <SlideButton size="md" autoReset fullWidth onComplete={() => {}}>
            <SlideButton.Label>Medium</SlideButton.Label>
          </SlideButton>
          <SlideButton size="lg" autoReset fullWidth onComplete={() => {}}>
            <SlideButton.Label>Large</SlideButton.Label>
          </SlideButton>
        </View>
      ),
    },
    {
      label: "How far it has to go",
      render: () => (
        <View className="w-full gap-3">
          <SlideButton
            threshold={0.5}
            autoReset
            fullWidth
            onComplete={() => {}}
          >
            <SlideButton.Label>Halfway is enough</SlideButton.Label>
          </SlideButton>
          <SlideButton
            variant="destructive"
            threshold={1}
            autoReset
            fullWidth
            onComplete={() => {}}
          >
            <SlideButton.Label>All the way, no shortcut</SlideButton.Label>
          </SlideButton>
        </View>
      ),
    },
    {
      label: "A glyph of your own",
      render: () => (
        <SlideButton autoReset fullWidth haptics onComplete={() => {}}>
          <SlideButton.Label>Slide to unlock</SlideButton.Label>
          <SlideButton.Thumb>
            <UnlockIcon size={20} />
          </SlideButton.Thumb>
        </SlideButton>
      ),
    },
    {
      label: "Refused",
      render: () => (
        <SlideButton disabled fullWidth onComplete={() => {}}>
          <SlideButton.Label>Nothing to confirm</SlideButton.Label>
        </SlideButton>
      ),
    },
  ],
};
