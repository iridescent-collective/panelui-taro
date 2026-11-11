import { authorize, getRecorderManager } from "@tarojs/taro";
import { expect, it, vi } from "vitest";

import { createRecorder } from "./recorder";
vi.mock("@tarojs/taro", () => ({
  authorize: vi.fn(),
  getRecorderManager: vi.fn(),
}));
it("does not start after disposal during permission and binds singleton callbacks once", async () => {
  let grant: (() => void) | undefined;
  vi.mocked(authorize).mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        grant = () => resolve({ errMsg: "ok" });
      })
  );
  const observer = { start: vi.fn(), stop: vi.fn(), error: vi.fn() };
  const first = createRecorder(observer);
  const pending = first.start();
  first.dispose();
  grant?.();
  await pending;
  expect(getRecorderManager).not.toHaveBeenCalled();
  const callbacks: Record<string, any> = {};
  const manager = {
    start: vi.fn(),
    stop: vi.fn(),
    onStart: vi.fn((fn) => {
      callbacks.start = fn;
    }),
    onStop: vi.fn((fn) => {
      callbacks.stop = fn;
    }),
    onError: vi.fn((fn) => {
      callbacks.error = fn;
    }),
    onPause: vi.fn(),
    onInterruptionBegin: vi.fn(),
  };
  vi.mocked(getRecorderManager).mockReturnValue(manager as any);
  vi.mocked(authorize).mockResolvedValue({ errMsg: "ok" });
  const second = createRecorder(observer);
  await second.start();
  callbacks.start();
  expect(observer.start).toHaveBeenCalledTimes(1);
  callbacks.stop({ tempFilePath: "/tmp/voice.mp3", duration: 1200 });
  expect(observer.stop).toHaveBeenCalledWith({
    path: "/tmp/voice.mp3",
    seconds: 1.2,
  });
  second.dispose();
  const third = createRecorder(observer);
  await third.start();
  third.dispose();
  const fourth = createRecorder(observer);
  await fourth.start();
  expect(observer.error).toHaveBeenCalledWith(
    "The microphone is already in use."
  );
  expect(manager.onStart).toHaveBeenCalledTimes(1);
  callbacks.stop({ tempFilePath: "/tmp/late.mp3", duration: 1000 });
  expect(observer.stop).toHaveBeenCalledTimes(1);
  const stops = manager.stop.mock.calls.length;
  callbacks.start();
  expect(manager.stop).toHaveBeenCalledTimes(stops);
});
