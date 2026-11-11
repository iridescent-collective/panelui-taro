import { Card } from "panelui-taro/card";
import { NumberInput } from "panelui-taro/number-input";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function NumberInputDemo() {
  const [qty, setQty] = useState(1);
  return (
    <Card className="w-full">
      <Card.Content className="gap-4 p-4">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1">
            <Text weight="medium">Wireless keyboard</Text>
            <Text size="sm" muted>
              {qty} × $49 = ${qty * 49}
            </Text>
          </View>
          <View className="w-32">
            <NumberInput value={qty} onValueChange={setQty} min={1} max={20} />
          </View>
        </View>
        <NumberInput
          label="Budget"
          defaultValue={40}
          min={0}
          max={1000}
          step={10}
          formatValue={(v) => `$${v}`}
        />
      </Card.Content>
    </Card>
  );
}
export const entry: ComponentEntry = {
  slug: "number-input",
  name: "NumberInput",
  summary: "Numeric field stepped by buttons or typed",
  demos: [
    { label: "Quantity & budget", render: () => <NumberInputDemo /> },
    {
      label: "Bounds & step",
      render: () => (
        <View className="w-full gap-5">
          <NumberInput defaultValue={0} min={0} max={5} />
          <NumberInput defaultValue={0} min={0} max={1} step={0.1} />
          <NumberInput
            label="Guests"
            description="Up to eight per reservation."
            defaultValue={2}
            min={1}
            max={8}
          />
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-5">
          <NumberInput size="sm" defaultValue={1} />
          <NumberInput size="md" defaultValue={1} />
          <NumberInput size="lg" defaultValue={1} />
        </View>
      ),
    },
    {
      label: "Variants",
      render: () => (
        <View className="w-full gap-5">
          <NumberInput variant="outline" defaultValue={1} />
          <NumberInput variant="filled" defaultValue={1} />
          <NumberInput defaultValue={3} disabled />
        </View>
      ),
    },
  ],
};
