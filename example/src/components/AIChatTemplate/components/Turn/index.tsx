import { Avatar } from "panelui-taro/avatar";
import { Message } from "panelui-taro/message";
import { Text } from "panelui-taro/primitives/text";
import { memo } from "react";

import type { ChatTurn as Turn } from "../../type";
import { AssistantBody } from "../AssistantBody";

export const ChatTurn = memo(
  ({
    turn,
    last,
    busy,
    onRetry,
  }: {
    turn: Turn;
    last: boolean;
    busy: boolean;
    onRetry: () => void;
  }) => {
    const user = turn.role === "user";
    return (
      <Message align={user ? "end" : "start"}>
        {user ? null : (
          <Message.Avatar>
            <Avatar size="sm" fallback="AI" />
          </Message.Avatar>
        )}
        <Message.Content className="flex min-w-0 flex-1 flex-col gap-[20px]">
          {user ? (
            <Message.Bubble>
              <Message.BubbleContent>{turn.text}</Message.BubbleContent>
              {turn.attachment ? (
                <Text
                  size="xs"
                  className="block text-[var(--panel-primary-foreground)]"
                >
                  Attached · Sample brief.txt
                </Text>
              ) : null}
            </Message.Bubble>
          ) : (
            <AssistantBody
              turn={turn}
              last={last}
              busy={busy}
              onRetry={onRetry}
            />
          )}
        </Message.Content>
      </Message>
    );
  }
);
