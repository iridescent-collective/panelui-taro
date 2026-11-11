import { Message } from "panelui-taro/message";
import { Text } from "panelui-taro/primitives/text";
import { Reasoning } from "panelui-taro/reasoning";
import { Response } from "panelui-taro/response";
import { Shimmer } from "panelui-taro/shimmer";
import { Task } from "panelui-taro/task";
import type { TaskStatus } from "panelui-taro/task";

import type { ChatTurn } from "../../type";
import { LiveBody } from "../LiveBody";
import { ReplyActions } from "../ReplyActions";
import { ReplyExtras } from "../ReplyExtras";

const TASK_STATUS: Record<ChatTurn["phase"], TaskStatus> = {
  complete: "complete",
  error: "error",
  stopped: "pending",
  streaming: "running",
  submitted: "running",
};
export const AssistantBody = ({
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
  const working = turn.phase === "submitted" || turn.phase === "streaming";
  return (
    <>
      {turn.live ? (
        <LiveBody turn={turn} />
      ) : (
        <>
          <Reasoning
            isStreaming={turn.phase === "submitted"}
            duration={working ? undefined : 1}
          >
            <Reasoning.Trigger
              label={(streaming) =>
                streaming ? "Preparing a response…" : "Approach · demo"
              }
            />
            <Reasoning.Content>
              Identify the request, organise the available example, and prepare
              a clear response. This is a demonstration summary.
            </Reasoning.Content>
          </Reasoning>
          {turn.kind === "research" ? (
            <Task status={TASK_STATUS[turn.phase]}>
              <Task.Trigger title="Organise an itinerary" />
              <Task.Content>
                <Task.Item>
                  Local sample itinerary · No live search was performed.
                </Task.Item>
              </Task.Content>
            </Task>
          ) : null}
          {turn.phase === "submitted" ? <Shimmer>Thinking…</Shimmer> : null}
          {turn.text ? (
            <Message.Bubble>
              <Response isStreaming={turn.phase === "streaming"}>
                {turn.text}
              </Response>
            </Message.Bubble>
          ) : null}
          {turn.phase === "complete" ? <ReplyExtras kind={turn.kind} /> : null}
          {turn.phase === "error" ? (
            <Text
              role="alert"
              className="block text-[var(--panel-destructive)]"
            >
              Could not get a response. This is the simulated connection error.
            </Text>
          ) : null}
        </>
      )}
      {turn.phase === "stopped" ? (
        <Text size="xs" muted className="block">
          Response stopped
        </Text>
      ) : null}
      {working ? null : (
        <ReplyActions turn={turn} last={last} busy={busy} onRetry={onRetry} />
      )}
    </>
  );
};
