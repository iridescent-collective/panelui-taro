import { MessageScroller } from "panelui-taro/message-scroller";

import type { ChatSession } from "../../type";
import { ChatTurn } from "../Turn";
import { ChatWelcome } from "../Welcome";

export const ChatTranscript = ({
  session,
  mode = "demo",
  busy,
  onChoose,
  onRetry,
}: {
  session: ChatSession;
  mode?: "demo" | "live";
  busy: boolean;
  onChoose: (prompt: string) => void;
  onRetry: () => void;
}) => (
  <MessageScroller
    key={session.messages.length ? "conversation" : "welcome"}
    autoScroll={session.messages.length > 0}
    defaultScrollPosition={session.messages.length ? "end" : "start"}
    className="h-0 min-h-0 flex-1 overflow-hidden"
  >
    <MessageScroller.Viewport className="h-full">
      <MessageScroller.Content className="flex flex-col gap-[40px] px-[28px] py-[24px]">
        {session.messages.length ? (
          session.messages.map((turn, index) => (
            <MessageScroller.Item
              key={turn.id}
              messageId={turn.id}
              scrollAnchor={turn.role === "user"}
            >
              <ChatTurn
                turn={turn}
                last={index === session.messages.length - 1}
                busy={busy && index === session.messages.length - 1}
                onRetry={onRetry}
              />
            </MessageScroller.Item>
          ))
        ) : (
          <ChatWelcome onChoose={onChoose} mode={mode} />
        )}
      </MessageScroller.Content>
    </MessageScroller.Viewport>
    <MessageScroller.Button accessibilityLabel="Jump to latest message" />
  </MessageScroller>
);
