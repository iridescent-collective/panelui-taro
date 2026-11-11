import { OtpInput } from "panelui-taro/otp-input";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function OtpVerifyDemo() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "bad">("idle");
  return (
    <View className="w-full items-center gap-4">
      <OtpInput
        value={code}
        onChangeText={(next) => {
          setCode(next);
          if (status !== "idle") setStatus("idle");
        }}
        onComplete={(value) => setStatus(value === "123456" ? "ok" : "bad")}
        isInvalid={status === "bad"}
        accessibilityLabel="Verification code"
      />
      <Text className="text-muted-foreground text-sm">
        {status === "ok"
          ? "Verified — the code was 123456."
          : status === "bad"
            ? "That code didn’t match. Try 123456."
            : "Type a six-digit code (123456)."}
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "otp-input",
  name: "OtpInput",
  summary: "One-time-code field, one cell per digit",
  demos: [
    { label: "Verify a code", render: () => <OtpVerifyDemo /> },
    {
      label: "Masked",
      render: () => (
        <View className="w-full items-center">
          <OtpInput length={4} mask defaultValue="12" />
        </View>
      ),
    },
    {
      label: "Grouped",
      render: () => (
        <View className="w-full items-center">
          <OtpInput length={6} groupEvery={3} defaultValue="12" />
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full items-center gap-4">
          <OtpInput size="sm" length={4} defaultValue="12" />
          <OtpInput size="md" length={4} defaultValue="12" />
          <OtpInput size="lg" length={4} defaultValue="12" />
        </View>
      ),
    },
    {
      label: "Letters",
      render: () => (
        <View className="w-full items-center">
          <OtpInput length={5} type="text" placeholder="•" />
        </View>
      ),
    },
  ],
};
