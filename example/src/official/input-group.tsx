import { Button } from "panelui-taro/button";
import { SearchIcon } from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { InputGroup } from "panelui-taro/input-group";
import { Label } from "panelui-taro/label";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function PasswordInputDemo() {
  const [visible, setVisible] = useState(false);
  return (
    <View className="w-full gap-1.5">
      <Label isRequired>Password</Label>
      <InputGroup>
        <InputGroup.Input
          placeholder="Enter your password"
          secureTextEntry={!visible}
        />
        <InputGroup.Suffix>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => setVisible((v) => !v)}
          >
            {visible ? "Hide" : "Show"}
          </Button>
        </InputGroup.Suffix>
      </InputGroup>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "input-group",
  name: "InputGroup",
  summary: "Input with prefix and suffix decorators",
  demos: [
    {
      label: "With prefix",
      render: () => (
        <InputGroup className="w-full">
          <InputGroup.Prefix isDecorative>
            <SearchIcon size={16} />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="Search products…" />
        </InputGroup>
      ),
    },
    { label: "Interactive suffix", render: () => <PasswordInputDemo /> },
    {
      label: "Disabled",
      render: () => (
        <InputGroup isDisabled className="w-full">
          <InputGroup.Prefix isDecorative>
            <SearchIcon size={16} />
          </InputGroup.Prefix>
          <InputGroup.Input placeholder="Disabled input" />
        </InputGroup>
      ),
    },
  ],
};
