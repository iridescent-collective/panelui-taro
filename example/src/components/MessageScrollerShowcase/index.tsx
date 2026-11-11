import { View } from "@tarojs/components";
import { Button } from "panelui-taro/button";
import {
  MessageScroller,
  useMessageScroller,
  useMessageScrollerVisibility,
} from "panelui-taro/message-scroller";
import { Text } from "panelui-taro/primitives/text";
import { useState } from "react";

const TranscriptControls = () => {
  const controls = useMessageScroller();
  const visible = useMessageScrollerVisibility();
  return (
    <View className="flex flex-col gap-[12px]">
      <Text size="xs">{JSON.stringify(visible)}</Text>
      <View className="flex flex-row gap-[12px]">
        <Button size="sm" onPress={() => controls.scrollToStart(false)}>
          Start
        </Button>
        <Button
          size="sm"
          onPress={() => controls.scrollToMessage("message-10", false)}
        >
          Turn 10
        </Button>
        <Button size="sm" onPress={() => controls.scrollToEnd(false)}>
          Latest
        </Button>
      </View>
    </View>
  );
};
const MessageRow = ({ id, index }: { id: string; index: number }) => (
  <View className="flex h-[144px] flex-col justify-center rounded-[var(--panel-radius-lg)] bg-[var(--panel-muted)] px-[24px]">
    <Text weight="semibold">{id}</Text>
    <Text size="xs">
      {index % 5 === 0 ? "Question" : "Reply"} · Read together
    </Text>
  </View>
);
export const MessageScrollerShowcase = () => {
  const [items, setItems] = useState(() =>
    Array.from({ length: 30 }, (_, index) => ({
      messageId: `message-${index}`,
      scrollAnchor: index % 5 === 0,
    }))
  );
  const [virtual, setVirtual] = useState(false);
  const [following, setFollowing] = useState(true);
  return (
    <View className="flex flex-col gap-[24px]">
      <MessageScroller
        key={virtual ? "virtual" : "plain"}
        autoScroll={following}
        defaultScrollPosition="last-anchor"
        className="h-[800px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)]"
      >
        <TranscriptControls />
        {virtual ? (
          <MessageScroller.List
            id="panel-messages-demo"
            data={items}
            renderItem={({ item, index }) => (
              <MessageRow id={item.messageId} index={index} />
            )}
          />
        ) : (
          <MessageScroller.Viewport id="panel-messages-demo">
            <MessageScroller.Content>
              {items.map((item, index) => (
                <MessageScroller.Item
                  key={item.messageId}
                  messageId={item.messageId}
                  scrollAnchor={item.scrollAnchor}
                >
                  <MessageRow id={item.messageId} index={index} />
                </MessageScroller.Item>
              ))}
            </MessageScroller.Content>
          </MessageScroller.Viewport>
        )}
        <MessageScroller.Button />
      </MessageScroller>
      <Button
        onPress={() =>
          setItems((current) => [
            ...current,
            { messageId: `message-${current.length}`, scrollAnchor: false },
          ])
        }
      >
        Append reply
      </Button>
      <Button
        onPress={() =>
          setItems((current) => [
            { messageId: `history-${Date.now()}`, scrollAnchor: true },
            ...current,
          ])
        }
      >
        Prepend history
      </Button>
      <Button onPress={() => setVirtual(!virtual)}>
        {virtual ? "Plain transcript" : "Virtual transcript"}
      </Button>
      <Button onPress={() => setFollowing(!following)}>
        {following ? "Disable follow" : "Enable follow"}
      </Button>
    </View>
  );
};
