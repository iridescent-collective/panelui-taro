import { Card } from "panelui-taro/card";
import { Item } from "panelui-taro/item";
import { Label } from "panelui-taro/label";
import { RadioGroup } from "panelui-taro/radio-group";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function RadioGroupSizesDemo() {
  const [picked, setPicked] = useState<Record<string, string>>({});
  return (
    <View className="gap-4">
      {(
        [
          ["xs", "Extra small"],
          ["sm", "Small"],
          ["md", "Medium"],
          ["lg", "Large"],
          ["xl", "Extra large"],
        ] as const
      ).map(([size, name]) => (
        <RadioGroup
          key={size}
          size={size}
          orientation="horizontal"
          value={picked[size] ?? "monthly"}
          onValueChange={(value) =>
            setPicked((current) => ({ ...current, [size]: value }))
          }
        >
          <RadioGroup.Item value="monthly" label={`${name}, monthly`} />
          <RadioGroup.Item value="yearly" label="Yearly" />
        </RadioGroup>
      ))}
    </View>
  );
}
function RadioGroupDemo() {
  const [plan, setPlan] = useState("pro");
  return (
    <RadioGroup value={plan} onValueChange={setPlan} className="w-full">
      <RadioGroup.Item value="free" label="Free — $0/month" />
      <RadioGroup.Item value="pro" label="Pro — $12/month" />
      <RadioGroup.Item value="team" label="Team — $36/month" />
    </RadioGroup>
  );
}
function RadioGroupRowDemo() {
  const [size, setSize] = useState("m");
  const [billing, setBilling] = useState("monthly");
  return (
    <View className="w-full gap-6">
      <View className="gap-2">
        <Label>Size</Label>

        <RadioGroup
          orientation="horizontal"
          value={size}
          onValueChange={setSize}
          className="w-full"
        >
          <RadioGroup.Item value="s" label="Small" />
          <RadioGroup.Item value="m" label="Medium" />
          <RadioGroup.Item value="l" label="Large" />
          <RadioGroup.Item value="xl" label="X-Large" />
        </RadioGroup>
      </View>

      <View className="gap-2">
        <Label>Billing</Label>

        <RadioGroup
          orientation="horizontal"
          variant="card"
          value={billing}
          onValueChange={setBilling}
          className="w-full"
        >
          <RadioGroup.Item
            value="monthly"
            label="Monthly"
            description="$12/mo"
          />
          <RadioGroup.Item
            value="yearly"
            label="Yearly"
            description="$120/yr"
          />
        </RadioGroup>
      </View>
    </View>
  );
}
function RadioGroupCardDemo() {
  const [plan, setPlan] = useState("pro");
  return (
    <RadioGroup
      value={plan}
      onValueChange={setPlan}
      variant="card"
      className="w-full"
    >
      <RadioGroup.Item
        value="starter"
        label="Starter"
        description="For a side project — one seat, community support."
      />
      <RadioGroup.Item
        value="pro"
        label="Pro"
        description="For growing teams — five seats, priority support."
      />
      <RadioGroup.Item
        value="max"
        label="Max"
        description="Everything, uncapped — unlimited seats and SSO."
      />
    </RadioGroup>
  );
}
function RadioGroupStyledDemo() {
  const [method, setMethod] = useState("card");
  return (
    <RadioGroup
      value={method}
      onValueChange={setMethod}
      variant="card"
      orientation="horizontal"
      className="w-full"
    >
      <RadioGroup.Item
        value="card"
        label="Card"
        description="Visa, Amex"
        className="bg-white"
        labelClassName="text-black"
        descriptionClassName="text-neutral-500"
      />
      <RadioGroup.Item
        value="wallet"
        label="Wallet"
        description="Apple Pay"
        className="bg-white"
        labelClassName="text-black"
        descriptionClassName="text-neutral-500"
      />
    </RadioGroup>
  );
}
const DELIVERY_SPEEDS = [
  { value: "standard", label: "Standard", description: "3–5 days" },
  { value: "express", label: "Express", description: "Next day" },
];
function RadioGroupSelectedLabelDemo() {
  const [speed, setSpeed] = useState("standard");
  return (
    <RadioGroup
      value={speed}
      onValueChange={setSpeed}
      variant="card"
      orientation="horizontal"
      className="w-full"
    >
      {DELIVERY_SPEEDS.map((option) => (
        <RadioGroup.Item
          key={option.value}
          value={option.value}
          label={option.label}
          description={option.description}
          labelClassName={
            option.value === speed ? undefined : "text-muted-foreground"
          }
        />
      ))}
    </RadioGroup>
  );
}
export const entry: ComponentEntry = {
  slug: "radio-group",
  name: "RadioGroup",
  summary: "Single-select list of options",
  demos: [
    { label: "Plans", render: () => <RadioGroupDemo /> },
    { label: "Horizontal", render: () => <RadioGroupRowDemo /> },
    { label: "Sizes", render: () => <RadioGroupSizesDemo /> },
    { label: "Cards", render: () => <RadioGroupCardDemo /> },
    { label: "Styled labels", render: () => <RadioGroupStyledDemo /> },
    {
      label: "Colouring the selected label",
      render: () => <RadioGroupSelectedLabelDemo />,
    },
    {
      label: "In a card",
      render: () => (
        <Card className="w-full">
          <Card.Header>
            <Card.Title>Delivery speed</Card.Title>
            <Card.Description>Choose how fast you need it.</Card.Description>
          </Card.Header>
          <Card.Content>
            <RadioGroupDemo />
          </Card.Content>
        </Card>
      ),
    },
  ],
};
