import { setClipboardData } from "@tarojs/taro";
import { Message } from "panelui-taro/message";
import { Text } from "panelui-taro/primitives/text";
import { Reasoning } from "panelui-taro/reasoning";
import { Response } from "panelui-taro/response";
import { Shimmer } from "panelui-taro/shimmer";
import { Sources } from "panelui-taro/sources";
import { Task } from "panelui-taro/task";
import type { TaskStatus } from "panelui-taro/task";

import type { ChatTurn } from "../../type";
const STATUS: Record<string, TaskStatus> = {
  "input-streaming": "pending",
  "input-available": "running",
  "output-available": "complete",
  "output-error": "error",
};
export const LiveBody = ({ turn }: { turn: ChatTurn }) => {
  const sources = (turn.parts ?? []).filter((part) => part.type === "source");
  return (
    <>
      {turn.reasoning ? (
        <Reasoning
          isStreaming={turn.phase === "streaming" && turn.reasoningStreaming}
        >
          <Reasoning.Trigger />
          <Reasoning.Content>{turn.reasoning}</Reasoning.Content>
        </Reasoning>
      ) : null}
      {turn.phase === "submitted" ? <Shimmer>Thinking…</Shimmer> : null}
      {(turn.parts ?? []).map((part, index) => {
        if (part.type === "text")
          return (
            <Message.Bubble key={index}>
              <Response isStreaming={turn.phase === "streaming"}>
                {part.text}
              </Response>
            </Message.Bubble>
          );
        if (part.type === "tool") {
          const unfinished =
            part.state === "input-streaming" ||
            part.state === "input-available";
          const stopped = turn.phase === "stopped" && unfinished;
          const status =
            unfinished && turn.phase === "error"
              ? "error"
              : stopped
                ? "pending"
                : STATUS[part.state];
          return (
            <Task key={part.id} status={status}>
              <Task.Trigger
                title={stopped ? `${part.name} · Stopped` : part.name}
              />
              <Task.Content>
                <Task.Item>{part.input ?? "Receiving arguments…"}</Task.Item>
                {part.output ? <Task.Item>{part.output}</Task.Item> : null}
                {part.error ? <Task.Item>{part.error}</Task.Item> : null}
                {stopped ? <Task.Item>Response stopped</Task.Item> : null}
              </Task.Content>
            </Task>
          );
        }
        return null;
      })}
      {sources.length ? (
        <Sources>
          <Sources.Trigger count={sources.length} />
          <Sources.Content>
            {sources.map((source) => (
              <Sources.Source
                key={source.id}
                href={source.url}
                title={source.title}
                onLinkPress={(url) => {
                  void setClipboardData({ data: url }).catch(() => undefined);
                }}
              />
            ))}
          </Sources.Content>
        </Sources>
      ) : null}
      {turn.phase === "error" ? (
        <Text
          role="alert"
          className="block text-[var(--panel-destructive-foreground)]"
        >
          {turn.error ?? "Could not get a response"}
        </Text>
      ) : null}
    </>
  );
};
