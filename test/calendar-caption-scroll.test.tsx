// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { useCaptionScroll } from "../src/components/Calendar/use-caption-scroll";
import { setElementCanvasNode } from "./taro-api";

it("positions once per open session, including reopening retained content", async () => {
  const scrollTo = vi.fn();
  const hook = renderHook(
    ({ open, offset }) => useCaptionScroll(offset, open),
    {
      initialProps: { open: true, offset: 420 },
    }
  );
  setElementCanvasNode(hook.result.current.id, { scrollTo });
  await act(async () => {
    hook.result.current.initialize();
    hook.result.current.initialize();
  });
  expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
    top: 420,
    animated: false,
  });
  hook.rerender({ open: true, offset: 900 });
  await act(async () => hook.result.current.initialize());
  expect(scrollTo).toHaveBeenCalledTimes(1);
  hook.rerender({ open: false, offset: 900 });
  hook.rerender({ open: true, offset: 900 });
  await act(async () => hook.result.current.initialize());
  expect(scrollTo).toHaveBeenLastCalledWith({ top: 900, animated: false });
  expect(scrollTo).toHaveBeenCalledTimes(2);
});

it("a gesture cancels queued initialization and later layout notifications", async () => {
  const scrollTo = vi.fn();
  const hook = renderHook(() => useCaptionScroll(420, true));
  setElementCanvasNode(hook.result.current.id, { scrollTo });
  await act(async () => {
    hook.result.current.initialize();
    hook.result.current.interrupt();
  });
  await act(async () => hook.result.current.initialize());
  expect(scrollTo).not.toHaveBeenCalled();
});

it("close and unmount invalidate native callbacks still in flight", async () => {
  const scrollTo = vi.fn();
  const hook = renderHook(({ open }) => useCaptionScroll(420, open), {
    initialProps: { open: true },
  });
  setElementCanvasNode(hook.result.current.id, { scrollTo });
  act(() => {
    hook.result.current.initialize();
    hook.rerender({ open: false });
  });
  await act(async () => {
    await Promise.resolve();
  });
  expect(scrollTo).not.toHaveBeenCalled();
  hook.rerender({ open: true });
  act(() => {
    hook.result.current.initialize();
    hook.unmount();
  });
  await act(async () => {
    await Promise.resolve();
  });
  expect(scrollTo).not.toHaveBeenCalled();
});
