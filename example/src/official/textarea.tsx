import { Card } from "panelui-taro/card";
import { SendIcon } from "panelui-taro/icons";
import { Text } from "panelui-taro/primitives/text";
import { Textarea } from "panelui-taro/textarea";
import { useState } from "react";

import { useSafeAreaInsets } from "../runtime/native";
import { ScrollView, View } from "../runtime/native";
import { KeyboardAvoider } from "../runtime/native";
import { ComponentEntry } from "../types";
function TextareaGrowDemo() {
  const [message, setMessage] = useState("");
  return (
    <View className="w-full gap-4">
      <Textarea
        autoGrow
        rows={2}
        maxRows={6}
        label="Message"
        placeholder="Type a few lines…"
        description="Starts at two rows, grows to six, then scrolls."
        value={message}
        onChangeText={setMessage}
      />
      <Textarea rows={2} placeholder="Fixed at two rows, for comparison" />
    </View>
  );
}
function TextareaCountDemo() {
  const [status, setStatus] = useState("Shipping the new calendar today.");
  return (
    <Textarea
      label="Status"
      rows={3}
      maxLength={140}
      showCount
      description="Keep it short."
      value={status}
      onChangeText={setStatus}
      containerClassName="w-full"
    />
  );
}
function TextareaComposerDemo() {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");
  return (
    <View className="min-h-0 flex-1">
      <ScrollView
        className="h-0 flex-1"
        contentContainerClassName="gap-3 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {[
          "The composer below starts at one row.",
          "Type past the first line and it opens up, a row at a time.",
          "At five rows it stops growing and scrolls instead.",
          "Focus it and it lifts by exactly its overlap with the keyboard.",
        ].map((line) => (
          <Card key={line}>
            <Card.Content className="p-4">
              <Text size="sm">{line}</Text>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <KeyboardAvoider
        mode="dock"
        bottomInset={insets.bottom}
        pointerEvents="box-none"
        className="absolute right-0 left-0 px-5"
        style={{ bottom: insets.bottom + 16 }}
      >
        <View className="border-border bg-surface flex-row items-end gap-2 rounded-3xl border p-2 shadow-lg">
          <Textarea
            autoGrow
            rows={1}
            maxRows={5}
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            className="border-0 bg-transparent px-2"
            containerClassName="flex-1"
            accessibilityLabel="Message"
          />
          <View className="bg-primary h-10 w-10 items-center justify-center rounded-full">
            <SendIcon size={18} />
          </View>
        </View>
      </KeyboardAvoider>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "textarea",
  name: "Textarea",
  summary: "Text that runs to several lines, sized in rows",
  demos: [
    {
      label: "Rows, not pixels",
      render: () => (
        <View className="w-full gap-4">
          <Textarea rows={2} placeholder="Two rows" />
          <Textarea rows={4} placeholder="Four rows" />
          <Textarea size="sm" rows={4} placeholder="Four smaller rows" />
        </View>
      ),
    },
    { label: "Growing with the text", render: () => <TextareaGrowDemo /> },
    {
      label: "Label, description and error",
      render: () => (
        <View className="w-full gap-4">
          <Textarea
            label="Bio"
            rows={3}
            placeholder="A short bio"
            description="Shown on your public profile."
          />
          <Textarea
            label="Feedback"
            rows={3}
            isRequired
            placeholder="What went wrong?"
            errorMessage="Tell us a little more."
          />
        </View>
      ),
    },
    { label: "Counting characters", render: () => <TextareaCountDemo /> },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-4">
          <Textarea
            size="xs"
            label="Extra small"
            rows={2}
            placeholder="13px type"
          />
          <Textarea size="sm" label="Small" rows={2} placeholder="14px type" />
          <Textarea size="md" label="Medium" rows={2} placeholder="16px type" />
          <Textarea
            size="lg"
            label="Large"
            rows={2}
            placeholder="16px type, roomier"
          />
          <Textarea
            size="xl"
            label="Extra large"
            rows={2}
            placeholder="18px type"
          />
        </View>
      ),
    },
    {
      label: "Filled",
      render: () => (
        <Card className="w-full">
          <Card.Content className="gap-4 p-4">
            <Textarea
              variant="filled"
              label="Notes"
              rows={3}
              placeholder="Anything we should know?"
            />
          </Card.Content>
        </Card>
      ),
    },
    {
      label: "A composer that avoids the keyboard",
      id: "composer",
      fullPage: true,
      description:
        "A one-row composer that grows as the message does and rides the keyboard up.",
      render: () => <TextareaComposerDemo />,
    },
  ],
};
