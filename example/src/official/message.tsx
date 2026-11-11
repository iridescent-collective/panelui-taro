import { Avatar } from "panelui-taro/avatar";
import { BottomSheet } from "panelui-taro/bottom-sheet";
import { Button } from "panelui-taro/button";
import {
  PlusSquareIcon,
  SendIcon,
  ShareNodesIcon,
  XIcon,
} from "panelui-taro/icons";
import { Message } from "panelui-taro/message";
import { Text } from "panelui-taro/primitives/text";
import { Shimmer } from "panelui-taro/shimmer";
import { useState } from "react";

import { demoAction } from "../runtime/demo-action";
import { Pressable, View } from "../runtime/native";
import { ComponentEntry } from "../types";
const AVATARS = [
  "https://i.pravatar.cc/150?img=12",
  "https://i.pravatar.cc/150?img=32",
  "https://i.pravatar.cc/150?img=47",
];
function MessageLongPressDemo() {
  const [open, setOpen] = useState(false);
  return (
    <View className="w-full gap-3">
      <Text size="sm" muted className="text-center">
        Press and hold the bubble.
      </Text>

      <Message align="end" onLongPress={() => setOpen(true)}>
        <Message.Content>
          <Message.Bubble>
            <Message.BubbleContent>
              Ship it — long-press me for actions.
            </Message.BubbleContent>
          </Message.Bubble>
        </Message.Content>
      </Message>

      <BottomSheet open={open} onOpenChange={setOpen}>
        <BottomSheet.Content>
          <Text size="lg" weight="semibold" className="mb-3">
            Message
          </Text>
          <View className="gap-1 pb-2">
            {[
              { label: "Copy", icon: <PlusSquareIcon size={16} /> },
              { label: "Reply", icon: <SendIcon size={16} /> },
              { label: "Forward", icon: <ShareNodesIcon size={16} /> },
            ].map((action) => (
              <Pressable
                key={action.label}
                accessibilityRole="menuitem"
                onPress={() => setOpen(false)}
                className="active:bg-accent flex-row items-center gap-3 rounded-xl px-3 py-3"
              >
                {action.icon}
                <Text>{action.label}</Text>
              </Pressable>
            ))}
            <Pressable
              accessibilityRole="menuitem"
              onPress={() => setOpen(false)}
              className="active:bg-accent flex-row items-center gap-3 rounded-xl px-3 py-3"
            >
              <XIcon size={16} />
              <Text className="text-destructive">Delete</Text>
            </Pressable>
          </View>
        </BottomSheet.Content>
      </BottomSheet>
    </View>
  );
}
export const entry: ComponentEntry = {
  slug: "message",
  name: "Message",
  summary: "Chat turn with avatar, bubble and metadata",
  demos: [
    {
      label: "Both sides",
      render: () => (
        <View className="w-full gap-3">
          <Message>
            <Message.Avatar>
              <Avatar size="sm" source={{ uri: AVATARS[1] }} fallback="OL" />
            </Message.Avatar>
            <Message.Content>
              <Message.Bubble>
                <Message.BubbleContent>
                  How can I help you today?
                </Message.BubbleContent>
              </Message.Bubble>
            </Message.Content>
          </Message>

          <Message align="end">
            <Message.Content>
              <Message.Bubble>
                <Message.BubbleContent>
                  Set a reminder for 9am tomorrow.
                </Message.BubbleContent>
              </Message.Bubble>
              <Message.Footer>Read</Message.Footer>
            </Message.Content>
          </Message>
        </View>
      ),
    },
    {
      label: "Header and footer",
      render: () => (
        <View className="w-full gap-3">
          <Message>
            <Message.Avatar>
              <Avatar size="sm" source={{ uri: AVATARS[2] }} fallback="OL" />
            </Message.Avatar>
            <Message.Content>
              <Message.Header>Olivia</Message.Header>
              <Message.Bubble>
                <Message.BubbleContent>
                  I pushed the fix — can you take another look?
                </Message.BubbleContent>
              </Message.Bubble>
              <Message.Footer>Yesterday at 18:04</Message.Footer>
            </Message.Content>
          </Message>
        </View>
      ),
    },
    {
      label: "Grouped turns",
      render: () => (
        <Message.Group align="start" className="w-full">
          {[
            "Looking that up…",
            "Found three matching invoices.",
            "Want me to export them?",
          ].map((body) => (
            <Message key={body}>
              <Message.Avatar>
                <Avatar size="sm" fallback="AI" />
              </Message.Avatar>
              <Message.Content>
                <Message.Bubble>
                  <Message.BubbleContent>{body}</Message.BubbleContent>
                </Message.Bubble>
              </Message.Content>
            </Message>
          ))}
        </Message.Group>
      ),
    },
    {
      label: "Streaming and actions",
      render: () => (
        <View className="w-full gap-3">
          <Message>
            <Message.Avatar>
              <Avatar size="sm" fallback="AI" />
            </Message.Avatar>
            <Message.Content>
              <Message.Bubble>
                <Shimmer textClassName="text-base">Thinking…</Shimmer>
              </Message.Bubble>
            </Message.Content>
          </Message>

          <Message>
            <Message.Avatar>
              <Avatar size="sm" fallback="AI" />
            </Message.Avatar>
            <Message.Content>
              <Message.Bubble>
                <Message.BubbleContent>
                  Your reminder is set for 9:00 tomorrow.
                </Message.BubbleContent>
              </Message.Bubble>
              <Message.Actions>
                <Button size="sm" variant="ghost" onPress={demoAction("Copy")}>
                  Copy
                </Button>
                <Button size="sm" variant="ghost" onPress={demoAction("Retry")}>
                  Retry
                </Button>
              </Message.Actions>
            </Message.Content>
          </Message>
        </View>
      ),
    },
    { label: "Long-press for actions", render: () => <MessageLongPressDemo /> },
  ],
};
