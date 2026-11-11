import { Button } from "panelui-taro/button";
import { Input } from "panelui-taro/input";
import { MarkdownEditor } from "panelui-taro/markdown-editor";
import { Text } from "panelui-taro/primitives/text";
import { useToast } from "panelui-taro/toast";
import { useState } from "react";

import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
const RELEASE_NOTE = `## What changed

Swiping between tabs no longer re-draws the whole panel on every frame, which
is what made a long list feel heavy on Android.

- The fade while dragging is **iOS only** now
- A committed swipe carries on without waiting for the next panel to mount
- Changing tab no longer rebuilds the gesture

> Upgrading is a version bump. Nothing here changes an API.

Read \`useTabs\` if you drive the tabs yourself.`;
function MarkdownEditorDemo() {
  const [draft, setDraft] = useState(RELEASE_NOTE);
  return (
    <MarkdownEditor
      value={draft}
      onValueChange={setDraft}
      rows={10}
      placeholder="Write something…"
      className="w-full"
    />
  );
}
function MarkdownEditorComposedDemo() {
  const [draft, setDraft] = useState(
    "A short note, with a **bold** word in it."
  );
  const words = draft.trim() ? draft.trim().split(/\s+/).length : 0;
  return (
    <MarkdownEditor value={draft} onValueChange={setDraft} className="w-full">
      <MarkdownEditor.Toolbar actions={["bold", "italic", "link"]}>
        <Text size="xs" muted>
          {words} {words === 1 ? "word" : "words"}
        </Text>
      </MarkdownEditor.Toolbar>
      <MarkdownEditor.Input rows={6} placeholder="Say something…" />
      <MarkdownEditor.Preview emptyText="Write a line and switch to Preview." />
    </MarkdownEditor>
  );
}
function MarkdownEditorComposerDemo() {
  const { toast } = useToast();
  const [draft, setDraft] = useState("");
  return (
    <View className="w-full gap-3">
      <MarkdownEditor value={draft} onValueChange={setDraft}>
        <MarkdownEditor.Toolbar showModeSwitch={false} />
        <MarkdownEditor.Input rows={4} placeholder="Leave a comment…" />
      </MarkdownEditor>
      <Button
        fullWidth
        disabled={!draft.trim()}
        onPress={() => {
          toast.show({
            variant: "success",
            label: "Comment posted",
            duration: 2000,
          });
          setDraft("");
        }}
      >
        Post
      </Button>
    </View>
  );
}
function MarkdownEditorPillDemo() {
  const [draft, setDraft] = useState(
    "A note with a **bold** word, and a list:\n\n- one\n- two"
  );
  return (
    <MarkdownEditor value={draft} onValueChange={setDraft} className="w-full">
      <MarkdownEditor.Toolbar variant="pill" />
      <MarkdownEditor.Input rows={8} placeholder="Write something…" />
      <MarkdownEditor.Preview emptyText="Write a line and press the eye." />
    </MarkdownEditor>
  );
}
function MarkdownEditorPreviewFirstDemo() {
  const [draft, setDraft] = useState(RELEASE_NOTE);
  return (
    <MarkdownEditor
      value={draft}
      onValueChange={setDraft}
      defaultMode="preview"
      rows={10}
      className="w-full"
    />
  );
}
export const entry: ComponentEntry = {
  slug: "markdown-editor",
  name: "MarkdownEditor",
  summary: "A field for writing markdown, and a way to see it rendered",
  demos: [
    { label: "The whole thing", render: () => <MarkdownEditorDemo /> },
    { label: "A floating toolbar", render: () => <MarkdownEditorPillDemo /> },
    {
      label: "Reading first",
      render: () => <MarkdownEditorPreviewFirstDemo />,
    },
    { label: "Composed by hand", render: () => <MarkdownEditorComposedDemo /> },
    { label: "A comment box", render: () => <MarkdownEditorComposerDemo /> },
  ],
};
