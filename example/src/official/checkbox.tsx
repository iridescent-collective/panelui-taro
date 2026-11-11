import { Checkbox, type CheckboxProps } from "panelui-taro/checkbox";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function StatefulCheckbox({
  checked: initial,
  ...props
}: Omit<CheckboxProps, "onCheckedChange">) {
  const [value, setValue] = useState(initial);
  return <Checkbox {...props} checked={value} onCheckedChange={setValue} />;
}
function CheckboxDemo() {
  const [marketing, setMarketing] = useState(true);
  const [updates, setUpdates] = useState(false);
  return (
    <View className="w-full gap-5">
      <Checkbox
        checked={marketing}
        onCheckedChange={setMarketing}
        label="Marketing & promotions"
        description="Special offers and exclusive deals"
      />
      <Checkbox
        checked={updates}
        onCheckedChange={setUpdates}
        label="Product updates"
        description="News about features and releases"
      />
    </View>
  );
}
function CheckboxSelectAllDemo() {
  const items = ["Email", "Push", "SMS"];
  const [on, setOn] = useState<string[]>(["Email"]);
  const all = on.length === items.length;
  const some = on.length > 0 && !all;
  const toggle = (id: string) =>
    setOn((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  return (
    <View className="w-full gap-4">
      <Checkbox
        checked={all}
        indeterminate={some}
        onCheckedChange={(next) => setOn(next ? [...items] : [])}
        label={all ? "Deselect all" : "Select all"}
      />
      <View className="gap-3 pl-7">
        {items.map((id) => (
          <Checkbox
            key={id}
            checked={on.includes(id)}
            onCheckedChange={() => toggle(id)}
            label={id}
          />
        ))}
      </View>
    </View>
  );
}
function CheckboxCardDemo() {
  const [picked, setPicked] = useState<string[]>(["pro"]);
  const toggle = (id: string) =>
    setPicked((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id]
    );
  return (
    <View className="w-full gap-3">
      {[
        ["starter", "Starter", "Everything you need to begin."],
        ["pro", "Pro", "Advanced analytics and priority support."],
        ["team", "Team", "Shared workspaces and audit logs."],
      ].map(([id, label, description]) => (
        <Checkbox
          key={id}
          variant="card"
          checked={picked.includes(id!)}
          onCheckedChange={() => toggle(id!)}
          label={label}
          description={description}
        />
      ))}
    </View>
  );
}
function CheckboxSharedLineDemo() {
  const [remember, setRemember] = useState(false);
  const [opened, setOpened] = useState(false);
  return (
    <View className="w-full gap-3">
      <View className="flex-row items-center justify-between gap-3">
        <Checkbox
          checked={remember}
          onCheckedChange={setRemember}
          label="Remember me"
          contentClassName="flex-none"
          hitSlop={8}
        />
        <Text className="text-primary" onPress={() => setOpened(true)}>
          Forgot password?
        </Text>
      </View>
      {opened ? (
        <Text size="sm" muted>
          Password reset link selected.
        </Text>
      ) : null}
    </View>
  );
}
function CheckboxLinkLabelDemo() {
  const [agreed, setAgreed] = useState(false);
  const [opened, setOpened] = useState("");
  return (
    <View className="w-full gap-3">
      <Checkbox
        checked={agreed}
        onCheckedChange={setAgreed}
        accessibilityLabel="I agree to the Terms and Privacy Policy"
        label={
          <>
            I agree to the{" "}
            <Text
              className="text-primary underline"
              onPress={() => setOpened("Terms")}
            >
              Terms
            </Text>{" "}
            and{" "}
            <Text
              className="text-primary underline"
              onPress={() => setOpened("Privacy Policy")}
            >
              Privacy Policy
            </Text>
          </>
        }
      />
      <Text size="sm" muted>
        {agreed ? "Agreed" : "Not agreed"}
        {opened ? ` · Opened ${opened}` : ""}
      </Text>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "checkbox",
  name: "Checkbox",
  summary: "Multi-select control with label",
  demos: [
    { label: "Sharing a line", render: () => <CheckboxSharedLineDemo /> },
    {
      label: "A link inside the label",
      render: () => <CheckboxLinkLabelDemo />,
    },
    { label: "With descriptions", render: () => <CheckboxDemo /> },
    { label: "Select all", render: () => <CheckboxSelectAllDemo /> },
    { label: "Card", render: () => <CheckboxCardDemo /> },
    {
      label: "States",
      render: () => (
        <View className="gap-4">
          <StatefulCheckbox checked label="Checked" />
          <StatefulCheckbox checked={false} label="Unchecked" />
          <StatefulCheckbox checked disabled label="Disabled" />
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="gap-1">
          <StatefulCheckbox size="xs" checked label="Extra small" />
          <StatefulCheckbox size="sm" checked label="Small" />
          <StatefulCheckbox size="md" checked label="Medium" />
          <StatefulCheckbox size="lg" checked label="Large" />
          <StatefulCheckbox size="xl" checked label="Extra large" />
        </View>
      ),
    },
  ],
};
