// @vitest-environment happy-dom

import type * as TaroComponents from "@tarojs/components";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { REPLIES } from "./constant";
import { useChatDemo } from "./hooks/use-chat-demo";
import { AIChatTemplate } from "./index";

vi.mock("@tarojs/components", async (importOriginal) => {
  const actual = await importOriginal<typeof TaroComponents>();
  return { ...actual, Canvas: actual.View };
});
afterEach(() => vi.useRealTimers());

it("rejects empty and duplicate sends and preserves partial text on stop", () => {
  vi.useFakeTimers();
  const { result } = renderHook(useChatDemo);
  act(() => result.current.send("  "));
  expect(result.current.session.messages).toHaveLength(0);
  act(() => {
    result.current.send("Plan a weekend");
    result.current.send("duplicate");
  });
  expect(result.current.session.messages).toHaveLength(2);
  act(() => vi.advanceTimersByTime(600));
  const partial = result.current.session.messages.at(-1)?.text;
  expect(partial?.length).toBeGreaterThan(0);
  act(() => result.current.stop());
  act(() => vi.advanceTimersByTime(10_000));
  expect(result.current.session.messages.at(-1)).toMatchObject({
    phase: "stopped",
    text: partial,
  });
  expect(result.current.busy).toBe(false);
});

it("retries a failed assistant turn without duplicating its user message", () => {
  vi.useFakeTimers();
  const { result } = renderHook(useChatDemo);
  act(() => result.current.setFailNext(true));
  act(() => result.current.send("React component"));
  act(() => vi.advanceTimersByTime(700));
  const id = result.current.session.messages.at(-1)?.id;
  expect(result.current.session.messages.at(-1)?.phase).toBe("error");
  act(() => result.current.retry());
  act(() => vi.advanceTimersByTime(10_000));
  expect(result.current.session.messages).toHaveLength(2);
  expect(result.current.session.messages.at(-1)).toMatchObject({
    id,
    phase: "complete",
    text: REPLIES.code,
  });
});

it("switching conversations cancels the old stream and retains drafts", () => {
  vi.useFakeTimers();
  const { result } = renderHook(useChatDemo);
  act(() => result.current.setDraft("my draft"));
  act(() => result.current.chooseSession("theme-tokens"));
  act(() => result.current.send("summarize a brief"));
  act(() => vi.advanceTimersByTime(600));
  act(() => result.current.chooseSession("welcome"));
  act(() => vi.advanceTimersByTime(10_000));
  expect(result.current.session.draft).toBe("my draft");
  expect(result.current.session.messages).toHaveLength(0);
  expect(
    result.current.sessions
      .find((session) => session.id === "theme-tokens")
      ?.messages.at(-1)?.phase
  ).toBe("stopped");
});

it("a new conversation cancels generation and preserves previous history", () => {
  vi.useFakeTimers();
  const { result } = renderHook(useChatDemo);
  act(() => result.current.send("Hello"));
  act(() => result.current.newSession());
  act(() => vi.advanceTimersByTime(10_000));
  expect(result.current.session.messages).toHaveLength(0);
  expect(
    result.current.sessions
      .find((session) => session.id === "welcome")
      ?.messages.at(-1)?.phase
  ).toBe("stopped");
});

it("consumes the sample attachment and locks model changes while busy", () => {
  vi.useFakeTimers();
  const { result } = renderHook(useChatDemo);
  act(() => {
    result.current.toggleAttachment();
    result.current.setModel("Reasoning");
  });
  act(() => result.current.send("Summarize the brief"));
  expect(result.current.session.messages[0].attachment).toBe(true);
  expect(result.current.session.attachment).toBe(false);
  act(() => result.current.setModel("Fast"));
  expect(result.current.session.model).toBe("Reasoning");
});

it("cleans up its stream timer on unmount", () => {
  vi.useFakeTimers();
  const { result, unmount } = renderHook(useChatDemo);
  act(() => result.current.send("hello"));
  expect(vi.getTimerCount()).toBe(1);
  unmount();
  expect(vi.getTimerCount()).toBe(0);
});

it("runs a suggested conversation and swaps stop for the upstream Retry action", () => {
  vi.useFakeTimers();
  render(<AIChatTemplate />);
  fireEvent.click(screen.getByText("Build something"));
  expect(screen.getByRole("button", { name: "Stop response" })).toBeTruthy();
  act(() => vi.advanceTimersByTime(10_000));
  expect(screen.getByText("Button.tsx")).toBeTruthy();
  expect(screen.getByText("Retry")).toBeTruthy();
});

it("keeps the typed draft when leaving the simulated voice mode", () => {
  render(<AIChatTemplate />);
  fireEvent.input(screen.getByPlaceholderText("Ask anything…"), {
    target: { value: "Keep this draft" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Open voice preview" }));
  expect(
    screen.getByText("Simulated voice · Microphone is not recording")
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "End voice mode" }));
  expect(screen.getByDisplayValue("Keep this draft")).toBeTruthy();
});

it("exercises a simulated failure and retry through the actual composer and options", () => {
  vi.useFakeTimers();
  render(<AIChatTemplate />);
  fireEvent.click(screen.getByText("Balanced"));
  fireEvent.click(
    screen.getByRole("switch", { name: "Simulate connection failure" })
  );
  fireEvent.click(screen.getByRole("radio", { name: "Fast" }));
  fireEvent.input(screen.getByPlaceholderText("Ask anything…"), {
    target: { value: "hello" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Send message" }));
  act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByRole("alert").textContent).toContain(
    "simulated connection error"
  );
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  act(() => vi.advanceTimersByTime(10000));
  expect(screen.queryByRole("alert")).toBeNull();
  expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
});
it("restores a draft after selecting a different conversation through the history drawer", async () => {
  render(<AIChatTemplate />);
  fireEvent.input(screen.getByPlaceholderText("Ask anything…"), {
    target: { value: "save this draft" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Open conversations" }));
  fireEvent.click(screen.getByRole("button", { name: "Theme tokens" }));
  expect(screen.getByText("Where should semantic colours live?")).toBeTruthy();
  await waitFor(() =>
    expect(
      screen.getByRole("button", { name: "Open conversations" })
    ).toBeTruthy()
  );
  fireEvent.click(screen.getByRole("button", { name: "Open conversations" }));
  const historyButtons = screen.getAllByRole("button", {
    name: "New conversation",
  });
  // One creates a session, the history entry selects the existing empty session.
  fireEvent.click(historyButtons.at(-1)!);
  expect(screen.getByDisplayValue("save this draft")).toBeTruthy();
});
