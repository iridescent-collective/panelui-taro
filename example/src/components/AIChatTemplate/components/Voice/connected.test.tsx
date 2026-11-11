// @vitest-environment happy-dom
import type * as TaroComponents from "@tarojs/components";
import { createInnerAudioContext } from "@tarojs/taro";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ConnectedVoice } from "./connected";
vi.mock("@tarojs/components", async (importOriginal) => {
  const actual = await importOriginal<typeof TaroComponents>();
  return { ...actual, Canvas: actual.View };
});
vi.mock("../../services/recorder", () => ({
  createRecorder: (observer: any) => ({
    start: async () => observer.start(),
    stop: () => observer.stop({ path: "/tmp/note.mp3", seconds: 1 }),
    dispose: vi.fn(),
  }),
}));
it("ignores a destroyed player's queued callbacks during a new recording", () => {
  let ended: () => void = () => {};
  let error: () => void = () => {};
  vi.mocked(createInnerAudioContext).mockReturnValue({
    onEnded: (fn: () => void) => {
      ended = fn;
    },
    onError: (fn: () => void) => {
      error = fn;
    },
    play: vi.fn(),
    destroy: vi.fn(),
    src: "",
  } as any);
  render(
    <ConnectedVoice answer="hello" onClose={vi.fn()} onTranscript={vi.fn()} />
  );
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  fireEvent.click(screen.getByRole("button", { name: "Stop recording" }));
  fireEvent.click(screen.getByText("Play recording"));
  fireEvent.click(screen.getByText("Cancel audio"));
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  act(() => {
    ended();
    error();
  });
  expect(screen.getByRole("button", { name: "Stop recording" })).toBeTruthy();
  expect(screen.queryByText("Audio playback failed")).toBeNull();
});

it("releases a naturally ended player before a subsequent recording", () => {
  let ended: () => void = () => {};
  let error: () => void = () => {};
  const destroy = vi.fn();
  vi.mocked(createInnerAudioContext).mockReturnValue({
    onEnded: (fn: () => void) => {
      ended = fn;
    },
    onError: (fn: () => void) => {
      error = fn;
    },
    play: vi.fn(),
    destroy,
    src: "",
  } as any);
  render(
    <ConnectedVoice answer="hello" onClose={vi.fn()} onTranscript={vi.fn()} />
  );
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  fireEvent.click(screen.getByRole("button", { name: "Stop recording" }));
  fireEvent.click(screen.getByText("Play recording"));
  act(() => ended());
  expect(destroy).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Start recording" }));
  act(() => error());
  expect(screen.getByRole("button", { name: "Stop recording" })).toBeTruthy();
  expect(screen.queryByText("Audio playback failed")).toBeNull();
});
