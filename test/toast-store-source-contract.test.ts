import { expect, it, vi } from "vitest";

import { ToastStore } from "../src/components/Toast/toast-store";

it("bare labels and full configs append stable snapshots with unique ids and idempotent hides", () => {
  const store = new ToastStore();
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  const first = store.show({ duration: 0, label: "First" });
  const snapshot = store.getSnapshot();
  const second = store.show({
    duration: 0,
    icon: null,
    label: "Second",
    placement: "top",
  });
  expect(first).not.toBe(second);
  expect(snapshot).toHaveLength(1);
  expect(store.getSnapshot()).toHaveLength(2);
  store.hide(first);
  store.hide(first);
  expect(listener).toHaveBeenCalledTimes(3);
  expect(store.getSnapshot()[0]?.icon).toBeNull();
  unsubscribe();
  store.hideAll();
  expect(listener).toHaveBeenCalledTimes(3);
});
it("countdowns pause with remaining visible time and newly queued paused notifications wait for resume", () => {
  vi.useFakeTimers();
  try {
    const store = new ToastStore();
    const id = store.show("Default duration");
    vi.advanceTimersByTime(1000);
    store.pauseTimers();
    store.show({ duration: 1000, label: "Queued while hidden" });
    vi.advanceTimersByTime(8000);
    expect(store.getSnapshot()).toHaveLength(2);
    store.resumeTimers();
    vi.advanceTimersByTime(1000);
    expect(store.getSnapshot().map((item) => item.id)).toEqual([id]);
    vi.advanceTimersByTime(2000);
    expect(store.getSnapshot()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("zero duration persists and hideAll clears every scheduled countdown", () => {
  vi.useFakeTimers();
  try {
    const store = new ToastStore();
    const id = store.show({ duration: 0, label: "Persistent" });
    store.show("Timed");
    vi.advanceTimersByTime(4000);
    expect(store.getSnapshot().map((item) => item.id)).toEqual([id]);
    store.show("Another");
    store.hideAll();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("a subscriber dismissing the just-created toast never leaves an orphan countdown", () => {
  vi.useFakeTimers();
  try {
    const store = new ToastStore();
    store.subscribe(() => {
      const [item] = store.getSnapshot();
      if (item) {
        store.hide(item.id);
      }
    });
    store.show("Immediately dismissed");
    expect(store.getSnapshot()).toHaveLength(0);
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
