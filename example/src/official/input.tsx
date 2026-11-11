import { Button } from "panelui-taro/button";
import { Card } from "panelui-taro/card";
import { PencilIcon, SearchIcon, SendIcon, XIcon } from "panelui-taro/icons";
import { Input } from "panelui-taro/input";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { useSafeAreaInsets } from "../runtime/native";
import { Pressable, ScrollView, View } from "../runtime/native";
import { KeyboardAvoider } from "../runtime/native";
import { ComponentEntry } from "../types";
function InputContentDemo() {
  const [query, setQuery] = useState("");
  return (
    <View className="w-full gap-4">
      <Input
        label="Description"
        placeholder="A short description"
        description="Shown on your public profile."
        startContent={<PencilIcon size={18} />}
      />

      <Input
        placeholder="Find a project"
        value={query}
        onChangeText={setQuery}
        startContent={
          <View pointerEvents="none">
            <SearchIcon size={18} />
          </View>
        }
        endContent={
          query ? (
            <Pressable
              onPress={() => setQuery("")}
              accessibilityLabel="Clear search"
            >
              <XIcon size={16} />
            </Pressable>
          ) : null
        }
      />

      <Input
        label="Amount"
        placeholder="0.00"
        keyboardType="decimal-pad"
        startContent={<Text muted>$</Text>}
        endContent={<Text muted>USD</Text>}
      />

      <Input
        label="Note"
        multiline
        placeholder="Anything worth remembering"
        startContent={<PencilIcon size={18} />}
      />

      <Text size="sm" muted>
        Every field here has a label, and the icons have not moved. That is the
        difference from wrapping the whole component — a label lands above the
        field, so anything centred on the component drifts up with it.
      </Text>
    </View>
  );
}
function KeyboardLiftDemo() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerClassName="gap-4 px-5 pt-4"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Input label="From" placeholder="you@example.com" />
      <Input label="To" placeholder="them@example.com" />
      <Input label="Subject" placeholder="An ordinary field" />
      <Input
        avoidKeyboard
        label="Comment"
        placeholder="Say something…"
        description="Lifts on focus, follows the scroll, settles back on blur."
        multiline
      />
      <Input label="Signature" placeholder="Sent from my phone" />
      <Input label="Reply-to" placeholder="Optional" />
      <Input label="Tags" placeholder="Comma separated" />
    </ScrollView>
  );
}
function KeyboardDockDemo() {
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState("");
  return (
    <View className="min-h-0 flex-1">
      <ScrollView
        className="h-0 flex-1"
        contentContainerClassName="gap-3 px-5 pt-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {[
          "Every control ships with its accessibility role wired up.",
          "Animations run on the UI thread, so a busy list never drops them.",
          "Tokens are semantic — a theme swap moves every component at once.",
          "The composer below stays put while this list scrolls.",
          "Open the keyboard and it travels with it, frame for frame.",
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
        <View className="border-border bg-surface flex-row items-center gap-2 rounded-full border px-4 shadow-lg">
          <Input
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            className="border-0 bg-transparent px-0"
            containerClassName="flex-1"
            accessibilityLabel="Message"
          />
          <SendIcon size={18} />
        </View>
      </KeyboardAvoider>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "input",
  name: "Input",
  summary: "Text field with label and validation",
  demos: [
    { label: "Icons inside the field", render: () => <InputContentDemo /> },
    {
      label: "States",
      render: () => (
        <View className="w-full gap-4">
          <Input label="Name" placeholder="Khalid Abdi" />
          <Input
            label="Description"
            placeholder="A short description"
            description="Shown on your public profile."
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            errorMessage="This email is already taken."
          />
          <Input label="Plan" value="Premium" disabled />
        </View>
      ),
    },
    {
      label: "Sizes",
      render: () => (
        <View className="w-full gap-4">
          <Input size="xs" label="Extra small" placeholder="32 tall" />
          <Input size="sm" label="Small" placeholder="40 tall" />
          <Input size="md" label="Medium" placeholder="48 tall" />
          <Input size="lg" label="Large" placeholder="56 tall" />
          <Input size="xl" label="Extra large" placeholder="64 tall" />
        </View>
      ),
    },
    {
      label: "Filled",
      render: () => (
        <Card className="w-full">
          <Card.Content className="gap-4 p-4">
            <Input
              variant="filled"
              label="Workspace"
              placeholder="Acme"
              isRequired
            />
            <Input
              variant="filled"
              label="Notes"
              placeholder="Anything we should know?"
              multiline
            />
          </Card.Content>
        </Card>
      ),
    },
    {
      label: "In a form",
      render: () => (
        <Card className="w-full">
          <Card.Header>
            <Card.Title>Sign in</Card.Title>
            <Card.Description>Welcome back.</Card.Description>
          </Card.Header>
          <Card.Content className="gap-4">
            <Input label="Email" placeholder="you@example.com" isRequired />
            <Input
              label="Password"
              secureTextEntry
              placeholder="••••••••"
              isRequired
            />
          </Card.Content>
          <Card.Footer>
            <Button fullWidth onPress={demoAction("Continue")}>
              Continue
            </Button>
          </Card.Footer>
        </Card>
      ),
    },
    {
      label: "Lifting in a scroll view",
      id: "in-a-scroll-view",
      fullPage: true,
      description:
        "A field that lifts by its overlap with the keyboard, and keeps its place in the form as you scroll.",
      render: () => <KeyboardLiftDemo />,
    },
    {
      label: "Docked composer",
      id: "docked-composer",
      fullPage: true,
      description:
        "A bar pinned to the bottom edge that rides the keyboard up and back down.",
      render: () => <KeyboardDockDemo />,
    },
  ],
};
