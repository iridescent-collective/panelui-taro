import { Button } from "panelui-taro/button";
import { Item } from "panelui-taro/item";
import { Text } from "panelui-taro/primitives/text";
import { Steps } from "panelui-taro/steps";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const STEP_DATA = [
  { title: "Account", description: "Create your login" },
  { title: "Profile", description: "Tell us about you" },
  { title: "Billing", description: "Add a payment method" },
];
function StepsDemo() {
  const [step, setStep] = useState(1);
  return (
    <View className="w-full gap-6">
      <Steps value={step} onValueChange={setStep}>
        {STEP_DATA.map((item, index) => (
          <Steps.Item
            key={item.title}
            step={index}
            className={index < STEP_DATA.length - 1 ? "flex-1" : undefined}
          >
            <Steps.Trigger>
              <Steps.Indicator />
            </Steps.Trigger>
          </Steps.Item>
        ))}
      </Steps>
      <View className="items-center gap-1">
        <Text weight="medium">{STEP_DATA[step]?.title}</Text>
        <Text size="sm" muted>
          {STEP_DATA[step]?.description}
        </Text>
      </View>
      <View className="flex-row gap-2">
        <Button
          variant="outline"
          className="flex-1"
          disabled={step === 0}
          onPress={() => setStep((current) => Math.max(0, current - 1))}
        >
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={step === STEP_DATA.length - 1}
          onPress={() =>
            setStep((current) => Math.min(STEP_DATA.length - 1, current + 1))
          }
        >
          Next
        </Button>
      </View>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "steps",
  name: "Steps",
  summary: "Stepper for multi-step flows",
  demos: [
    { label: "Horizontal", render: () => <StepsDemo /> },
    {
      label: "Vertical",
      render: () => (
        <Steps defaultValue={1} orientation="vertical" className="w-full">
          {STEP_DATA.map((step, index) => (
            <Steps.Item key={step.title} step={index}>
              <Steps.Trigger>
                <Steps.Indicator />
                <View className="flex-1">
                  <Steps.Title>{step.title}</Steps.Title>
                  <Steps.Description>{step.description}</Steps.Description>
                </View>
              </Steps.Trigger>
            </Steps.Item>
          ))}
        </Steps>
      ),
    },
    {
      label: "Loading",
      render: () => (
        <Steps value={1} orientation="vertical" className="w-full">
          {STEP_DATA.map((step, index) => (
            <Steps.Item key={step.title} step={index} loading={index === 1}>
              <Steps.Trigger>
                <Steps.Indicator />
                <View className="flex-1">
                  <Steps.Title>{step.title}</Steps.Title>
                </View>
              </Steps.Trigger>
            </Steps.Item>
          ))}
        </Steps>
      ),
    },
  ],
};
