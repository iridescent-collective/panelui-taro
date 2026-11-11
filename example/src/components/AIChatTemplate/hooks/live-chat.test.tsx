import { useDidHide } from "@tarojs/taro";
// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import type {
  ChatEvent,
  ChatRequest,
  ChatTransport,
} from "../services/protocol";
import { useChatDemo } from "./use-chat-demo";
afterEach(() => vi.useRealTimers());
function driver() {
  let event: (event: ChatEvent) => void = () => {};
  let fail: (error: Error) => void = () => {};
  let body: ChatRequest = { messages: [] };
  const abort = vi.fn();
  const transport: ChatTransport = (request, onEvent, onError) => {
    body = request;
    event = onEvent;
    fail = onError;
    return abort;
  };
  return {
    transport,
    abort,
    event: (value: ChatEvent) => event(value),
    fail: (error: Error) => fail(error),
    body: () => body,
  };
}
it("coalesces tokens, preserves ordered tool parts and flushes before completion", () => {
  vi.useFakeTimers();
  const stream = driver();
  const { result } = renderHook(() =>
    useChatDemo({ initialMode: "live", transport: stream.transport })
  );
  act(() => result.current.send("Find PanelUI docs"));
  act(() => {
    stream.event({ type: "text", delta: "First" });
    stream.event({
      type: "tool",
      id: "a",
      name: "docs",
      state: "input-available",
      input: "{}",
    });
    stream.event({
      type: "tool",
      id: "a",
      name: "docs",
      state: "output-available",
      output: "found",
    });
    stream.event({ type: "text", delta: "Then" });
  });
  expect(result.current.session.messages.at(-1)?.text).toBe("");
  act(() => vi.advanceTimersByTime(50));
  expect(
    result.current.session.messages.at(-1)?.parts?.map((part) => part.type)
  ).toEqual(["text", "tool", "text"]);
  act(() => {
    stream.event({ type: "text", delta: "Done" });
    stream.event({ type: "finish" });
  });
  expect(result.current.session.messages.at(-1)).toMatchObject({
    text: "FirstThenDone",
    phase: "complete",
  });
  expect(result.current.busy).toBe(false);
});
it("stop flushes pending text, aborts the network, rejects late events and retries once", () => {
  vi.useFakeTimers();
  const stream = driver();
  const { result } = renderHook(() =>
    useChatDemo({ initialMode: "live", transport: stream.transport })
  );
  act(() => {
    result.current.send("hello");
    result.current.send("duplicate");
  });
  act(() => stream.event({ type: "text", delta: "partial" }));
  act(() => result.current.stop());
  act(() => stream.event({ type: "text", delta: "late" }));
  expect(stream.abort).toHaveBeenCalledTimes(1);
  expect(result.current.session.messages.at(-1)).toMatchObject({
    text: "partial",
    phase: "stopped",
  });
  act(() => result.current.retry());
  expect(result.current.session.messages).toHaveLength(2);
  expect(stream.body().messages).toEqual([{ role: "user", content: "hello" }]);
  act(() => stream.fail(new Error("offline")));
  expect(result.current.session.messages.at(-1)).toMatchObject({
    phase: "error",
    error: "offline",
    text: "",
  });
});
it("page hide and unmount cancel live work and discard late callbacks", () => {
  vi.useFakeTimers();
  const stream = driver();
  const { result, unmount } = renderHook(() =>
    useChatDemo({ initialMode: "live", transport: stream.transport })
  );
  act(() => result.current.send("hello"));
  const hide = vi.mocked(useDidHide).mock.calls.at(-1)?.[0];
  act(() => hide?.());
  expect(stream.abort).toHaveBeenCalledTimes(1);
  act(() => result.current.send("again"));
  act(() => stream.event({ type: "text", delta: "pending" }));
  unmount();
  expect(stream.abort).toHaveBeenCalledTimes(2);
  expect(vi.getTimerCount()).toBe(0);
});

it("restores each historical conversation's driver when switching between modes", () => {
  vi.useFakeTimers();
  const stream = driver();
  const { result } = renderHook(() =>
    useChatDemo({ initialMode: "live", transport: stream.transport })
  );
  act(() => result.current.send("live question"));
  act(() => stream.event({ type: "finish" }));
  act(() => result.current.chooseSession("theme-tokens"));
  expect(result.current.mode).toBe("demo");
  act(() => result.current.send("local followup"));
  expect(result.current.session.messages.at(-1)?.live).toBe(false);
  act(() => result.current.chooseSession("welcome"));
  expect(result.current.mode).toBe("live");
  act(() => result.current.send("live followup"));
  expect(stream.body().messages.at(-1)?.content).toBe("live followup");
});

it("preserves a prior tool result and source when the user asks a follow-up", () => {
  const stream = driver();
  const { result } = renderHook(() =>
    useChatDemo({ initialMode: "live", transport: stream.transport })
  );
  act(() => result.current.send("Find voice docs"));
  act(() => {
    stream.event({
      type: "tool",
      id: "a",
      name: "docs",
      state: "output-available",
      output: "https://panelui.dev/docs/ai/voice",
    });
    stream.event({
      type: "source",
      id: "voice",
      title: "Voice",
      url: "https://panelui.dev/docs/ai/voice",
    });
    stream.event({ type: "finish" });
  });
  act(() => result.current.send("What was that source URL?"));
  expect(stream.body().messages[1]).toMatchObject({ role: "assistant" });
  expect(stream.body().messages[1].content).toContain(
    "Tool result (docs): https://panelui.dev/docs/ai/voice"
  );
  expect(stream.body().messages[1].content).toContain(
    "Source (Voice): https://panelui.dev/docs/ai/voice"
  );
});
