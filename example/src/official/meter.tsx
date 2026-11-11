import { Input } from "panelui-taro/input";
import { Meter } from "panelui-taro/meter";
import { useEffect, useMemo, useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function MeterDemo() {
  const [charge, setCharge] = useState(96);
  useEffect(() => {
    const id = setInterval(() => {
      setCharge((current) => (current <= 4 ? 96 : current - 8));
    }, 900);
    return () => clearInterval(id);
  }, []);
  return (
    <View className="w-full gap-5">
      <Meter
        value={charge}
        label="Battery"
        showValueLabel
        thresholds={[
          { from: 0, color: "destructive" },
          { from: 20, color: "warning" },
          { from: 50, color: "success" },
        ]}
      />
      <Meter
        value={168}
        maxValue={256}
        label="Storage"
        showValueLabel
        formatOptions={{ style: "unit", unit: "gigabyte" }}
        color="success"
        thresholds={[
          { from: 180, color: "warning" },
          { from: 230, color: "destructive" },
        ]}
      />
    </View>
  );
}
function PasswordStrengthDemo() {
  const [password, setPassword] = useState("hunter2");
  const score = useMemo(() => {
    if (!password) return 0;
    let earned = 0;
    if (password.length >= 8) earned += 1;
    if (password.length >= 12) earned += 1;
    if (/[^a-zA-Z0-9]/.test(password)) earned += 1;
    if (
      /[0-9]/.test(password) &&
      /[a-z]/.test(password) &&
      /[A-Z]/.test(password)
    ) {
      earned += 1;
    }
    return Math.min(earned, 4);
  }, [password]);
  return (
    <View className="w-full gap-3">
      <Input
        value={password}
        onChangeText={setPassword}
        placeholder="Choose a password"
      />

      <Meter
        value={score}
        maxValue={4}
        segments={4}
        label="Password strength"
        showValueLabel
        valueLabel={["Too short", "Weak", "Fair", "Good", "Strong"][score]}
        thresholds={[
          { from: 0, color: "destructive" },
          { from: 2, color: "warning" },
          { from: 3, color: "success" },
        ]}
      />
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "meter",
  name: "Meter",
  summary: "A measurement on a fixed scale, coloured by where it falls",
  demos: [
    { label: "Thresholds", render: () => <MeterDemo /> },
    { label: "Segmented", render: () => <PasswordStrengthDemo /> },
    {
      label: "Colours",
      render: () => (
        <View className="w-full gap-4">
          <Meter value={60} color="primary" />
          <Meter value={60} color="success" />
          <Meter value={60} color="warning" />
          <Meter value={60} color="destructive" />
          <Meter value={60} color="info" />
          <Meter value={60} color="muted" />
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-4">
          <Meter value={60} size="sm" accessibilityLabel="Small" />
          <Meter value={60} size="md" accessibilityLabel="Medium" />
          <Meter value={60} size="lg" accessibilityLabel="Large" />
        </View>
      ),
    },
    {
      label: "Counted, not measured",
      render: () => (
        <View className="w-full gap-5">
          <Meter
            value={3}
            maxValue={5}
            segments={5}
            label="Signal"
            showValueLabel
            valueLabel="3 of 5 bars"
            color="info"
          />
          <Meter
            value={7}
            maxValue={10}
            segments={10}
            label="Questions right"
            showValueLabel
            size="lg"
            color="success"
          />
        </View>
      ),
    },
  ],
};
