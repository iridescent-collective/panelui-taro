import { setClipboardData } from "@tarojs/taro";
import { Button } from "panelui-taro/button";
import { Message } from "panelui-taro/message";

import type { ChatTurn } from "../../type";

export const ReplyActions = ({
  turn,
  last,
  busy,
  onRetry,
}: {
  turn: ChatTurn;
  last: boolean;
  busy: boolean;
  onRetry: () => void;
}) => {
  const copy = () => {
    void setClipboardData({ data: turn.text }).catch(() => undefined);
  };
  return (
    <Message.Actions>
      {turn.text ? (
        <Button size="sm" variant="ghost" onPress={copy}>
          Copy
        </Button>
      ) : null}
      {last ? (
        <Button size="sm" variant="ghost" disabled={busy} onPress={onRetry}>
          Retry
        </Button>
      ) : null}
    </Message.Actions>
  );
};
