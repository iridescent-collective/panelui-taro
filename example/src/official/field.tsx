import { Checkbox } from "panelui-taro/checkbox";
import { Field } from "panelui-taro/field";
import { Input } from "panelui-taro/input";
import { Label } from "panelui-taro/label";
import { Separator } from "panelui-taro/separator";
import { Switch } from "panelui-taro/switch";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function FieldDemo() {
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [username, setUsername] = useState("taken-name");
  const errors =
    username === "taken-name" ? ["That username is already taken."] : [];
  return (
    <View className="w-full gap-6">
      <Field.Set>
        <Field.Legend>Notifications</Field.Legend>
        <Checkbox checked={email} onCheckedChange={setEmail} label="Email" />
        <Checkbox checked={sms} onCheckedChange={setSms} label="SMS" />
      </Field.Set>

      <Field.Separator />

      <Field orientation="horizontal">
        <Field.Content>
          <Field.Title>Advanced analytics</Field.Title>
          <Field.Description>Included with the Pro plan.</Field.Description>
        </Field.Content>
        <Switch value={analytics} onValueChange={setAnalytics} />
      </Field>

      <Field invalid={errors.length > 0}>
        <Field.Label isRequired>Username</Field.Label>
        <Input value={username} onChangeText={setUsername} />
        <Field.Error errors={errors} />
      </Field>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "field",
  name: "Field",
  summary: "Layout and validation-state kit for a form control",
  demos: [{ label: "Anatomy", render: () => <FieldDemo /> }],
};
