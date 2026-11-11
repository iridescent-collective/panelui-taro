import { Avatar } from "panelui-taro/avatar";
import { Button } from "panelui-taro/button";
import { Item } from "panelui-taro/item";
import { Marker } from "panelui-taro/marker";
import { Message } from "panelui-taro/message";
import { MessageScroller } from "panelui-taro/message-scroller";
import { useState } from "react";

import { useSafeAreaInsets } from "../runtime/native";
import { View } from "../runtime/native";
import { ComponentEntry } from "../types";
interface Turn {
  id: string;
  role: "user" | "assistant";
  text: string;
}
const THREAD: Turn[] = [
  { id: "t1", role: "user", text: "Can you summarise last quarter?" },
  {
    id: "t2",
    role: "assistant",
    text: "Revenue was up 14% on the quarter before, driven mostly by renewals.",
  },
  { id: "t3", role: "user", text: "Which plan grew fastest?" },
  {
    id: "t4",
    role: "assistant",
    text: "Team. It roughly doubled its seat count, while Pro stayed flat.",
  },
  { id: "t5", role: "user", text: "And churn?" },
  {
    id: "t6",
    role: "assistant",
    text: "Down to 2.1% monthly, the lowest it has been all year.",
  },
  { id: "t7", role: "user", text: "What should I look at next?" },
  {
    id: "t8",
    role: "assistant",
    text: "Expansion revenue. It is the line that explains most of the growth, and it is the one nobody is tracking weekly.",
  },
];
function Turn({ turn }: { turn: Turn }) {
  return turn.role === "user" ? (
    <Message align="end">
      <Message.Content>
        <Message.Bubble>
          <Message.BubbleContent>{turn.text}</Message.BubbleContent>
        </Message.Bubble>
      </Message.Content>
    </Message>
  ) : (
    <Message>
      <Message.Avatar>
        <Avatar size="sm" fallback="AI" />
      </Message.Avatar>
      <Message.Content>
        <Message.Bubble>
          <Message.BubbleContent>{turn.text}</Message.BubbleContent>
        </Message.Bubble>
      </Message.Content>
    </Message>
  );
}
const REPLY =
  "Looking at the numbers now. Expansion revenue came to $412k for the quarter, up from $290k. Most of it is seat growth inside accounts that were already on Team, which is the healthiest kind — nobody had to be sold anything twice.";
function StreamingTranscriptDemo() {
  const [turns, setTurns] = useState<Turn[]>(THREAD.slice(0, 4));
  const [streaming, setStreaming] = useState(false);
  const insets = useSafeAreaInsets();
  const send = () => {
    if (streaming) return;
    const askId = `ask-${Date.now()}`;
    const replyId = `reply-${Date.now()}`;
    setTurns((current) => [
      ...current,
      { id: askId, role: "user", text: "Break down expansion revenue." },
      { id: replyId, role: "assistant", text: "" },
    ]);
    setStreaming(true);
    const words = REPLY.split(" ");
    let index = 0;
    const timer = setInterval(() => {
      index += 1;
      setTurns((current) =>
        current.map((turn) =>
          turn.id === replyId
            ? { ...turn, text: words.slice(0, index).join(" ") }
            : turn
        )
      );
      if (index >= words.length) {
        clearInterval(timer);
        setStreaming(false);
      }
    }, 90);
  };
  return (
    <View className="flex-1">
      <MessageScroller autoScroll className="flex-1">
        <MessageScroller.Viewport>
          <MessageScroller.Content>
            {turns.map((turn) => (
              <MessageScroller.Item
                key={turn.id}
                messageId={turn.id}
                scrollAnchor={turn.role === "user"}
              >
                <Turn turn={turn} />
              </MessageScroller.Item>
            ))}
            {streaming ? (
              <Marker>
                <Marker.Content shimmer>Generating…</Marker.Content>
              </Marker>
            ) : null}
          </MessageScroller.Content>
        </MessageScroller.Viewport>
        <MessageScroller.Button />
      </MessageScroller>

      <View
        className="border-border border-t px-5 pt-3"
        style={{ paddingBottom: Math.max(insets.bottom, 12) }}
      >
        <Button onPress={send} loading={streaming} fullWidth>
          {streaming ? "Streaming" : "Send a message"}
        </Button>
      </View>
    </View>
  );
}
function HistoryTranscriptDemo() {
  const [turns, setTurns] = useState<Turn[]>(THREAD.slice(4));
  const [page, setPage] = useState(0);
  const loadOlder = () => {
    const older: Turn[] = Array.from({ length: 4 }, (_, index) => ({
      id: `old-${page}-${index}`,
      role: index % 2 === 0 ? "user" : "assistant",
      text:
        index % 2 === 0
          ? `An older question, ${page * 4 + index + 1} turns back.`
          : "And the answer that went with it, long enough to take a couple of lines on a phone.",
    }));
    setTurns((current) => [...older, ...current]);
    setPage((current) => current + 1);
  };
  return (
    <MessageScroller className="flex-1" defaultScrollPosition="end">
      <MessageScroller.Viewport>
        <MessageScroller.Content>
          <View className="items-center pb-1">
            <Button variant="ghost" size="sm" onPress={loadOlder}>
              Load older messages
            </Button>
          </View>
          {turns.map((turn) => (
            <MessageScroller.Item
              key={turn.id}
              messageId={turn.id}
              scrollAnchor={turn.role === "user"}
            >
              <Turn turn={turn} />
            </MessageScroller.Item>
          ))}
        </MessageScroller.Content>
      </MessageScroller.Viewport>
      <MessageScroller.Button />
    </MessageScroller>
  );
}
function SavedThreadDemo() {
  return (
    <MessageScroller className="flex-1" defaultScrollPosition="last-anchor">
      <MessageScroller.Viewport>
        <MessageScroller.Content>
          <Marker variant="separator">
            <Marker.Content>Yesterday</Marker.Content>
          </Marker>
          {THREAD.map((turn) => (
            <MessageScroller.Item
              key={turn.id}
              messageId={turn.id}
              scrollAnchor={turn.role === "user"}
            >
              <Turn turn={turn} />
            </MessageScroller.Item>
          ))}
        </MessageScroller.Content>
      </MessageScroller.Viewport>
      <MessageScroller.Button target="start" />
    </MessageScroller>
  );
}
export const entry: ComponentEntry = {
  slug: "message-scroller",
  name: "MessageScroller",
  summary: "Scroll behaviour a chat transcript needs",
  demos: [
    {
      label: "Following a streamed reply",
      id: "streaming",
      fullPage: true,
      description:
        "Pins to the bottom while a reply streams — but only while you are already there. Scroll up mid-stream and it stops chasing.",
      render: () => <StreamingTranscriptDemo />,
    },
    {
      label: "Loading history",
      id: "history",
      fullPage: true,
      description:
        "Older turns are added above you. The message you are reading does not move.",
      render: () => <HistoryTranscriptDemo />,
    },
    {
      label: "Opening a saved thread",
      id: "saved",
      fullPage: true,
      description:
        "Opens on the last turn that started something, rather than at the bottom of the reply to it.",
      render: () => <SavedThreadDemo />,
    },
  ],
};
