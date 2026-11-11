import { Card } from "panelui-taro/card";
import { Text } from "panelui-taro/primitives/text";
import { TagInput } from "panelui-taro/tag-input";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
function TagInputDemo() {
  const [tags, setTags] = useState<string[]>(["expo", "reanimated"]);
  return (
    <View className="w-full gap-3">
      <TagInput
        label="Topics"
        value={tags}
        onValueChange={setTags}
        placeholder="Add a topic"
        description="Return or a comma ends a tag."
        clearable
      />
      <Text size="sm" muted>
        {tags.length ? tags.join(" · ") : "No topics yet"}
      </Text>
    </View>
  );
}
function TagInputLimitDemo() {
  const [tags, setTags] = useState<string[]>(["urgent", "billing"]);
  const [refused, setRefused] = useState<string | null>(null);
  return (
    <TagInput
      label="Labels"
      value={tags}
      onValueChange={(next) => {
        setRefused(null);
        setTags(next);
      }}
      max={4}
      showCount
      placeholder="Add a label"
      errorMessage={refused ?? undefined}
      onReject={(tag, reason) =>
        setRefused(
          reason === "max"
            ? `Four labels is the limit — “${tag}” was not added.`
            : `“${tag}” is already on the list.`
        )
      }
    />
  );
}
function TagInputValidateDemo() {
  const [recipients, setRecipients] = useState<string[]>(["ana@example.com"]);
  const [error, setError] = useState<string | null>(null);
  return (
    <TagInput
      label="Recipients"
      value={recipients}
      onValueChange={(next) => {
        setError(null);
        setRecipients(next);
      }}
      chipVariant="info"
      keyboardType="email-address"
      placeholder="name@example.com"
      delimiters={[",", " ", ";"]}
      validate={(tag) => tag.includes("@") && tag.includes(".")}
      onReject={(tag) => setError(`“${tag}” is not an email address.`)}
      errorMessage={error ?? undefined}
      description="A comma, a space or a semicolon ends an address."
    />
  );
}
export const entry: ComponentEntry = {
  slug: "tag-input",
  name: "TagInput",
  summary: "A field whose value is a list of tokens",
  demos: [
    { label: "Typing tags", render: () => <TagInputDemo /> },
    { label: "A capped list", render: () => <TagInputLimitDemo /> },
    { label: "Deciding what counts", render: () => <TagInputValidateDemo /> },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-4">
          <TagInput size="sm" defaultValue={["small"]} placeholder="Small" />
          <TagInput size="md" defaultValue={["medium"]} placeholder="Medium" />
          <TagInput size="lg" defaultValue={["large"]} placeholder="Large" />
        </View>
      ),
    },
    {
      label: "Filled",
      render: () => (
        <Card className="w-full">
          <Card.Content className="gap-4 p-4">
            <TagInput
              variant="filled"
              label="Skills"
              defaultValue={["typescript", "swift"]}
              placeholder="Add a skill"
            />
          </Card.Content>
        </Card>
      ),
    },
    {
      label: "States",
      render: () => (
        <View className="w-full gap-4">
          <TagInput
            label="Read-only"
            readOnly
            defaultValue={["locked", "archived"]}
          />
          <TagInput
            label="Disabled"
            disabled
            defaultValue={["unavailable"]}
            placeholder="Add a tag"
          />
        </View>
      ),
    },
  ],
};
