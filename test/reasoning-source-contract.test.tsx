// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useEffect } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Reasoning } from "../src/components/Reasoning";

const reasoningView = (streaming: boolean) => (
  <PanelUIProvider reducedMotion>
    <Reasoning isStreaming={streaming}>
      <Reasoning.Trigger />
      <Reasoning.Content>trace</Reasoning.Content>
    </Reasoning>
  </PanelUIProvider>
);
it("live traces open, measure duration, auto-close once and respect a manual reopening", () => {
  vi.useFakeTimers();
  try {
    const { rerender } = render(reasoningView(true));
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
      "true"
    );
    act(() => vi.advanceTimersByTime(2100));
    rerender(reasoningView(false));
    expect(screen.getByText("Thought for 2 seconds")).toBeTruthy();
    act(() => vi.advanceTimersByTime(1000));
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
      "false"
    );
    fireEvent.click(screen.getByRole("button"));
    act(() => vi.advanceTimersByTime(2000));
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
      "true"
    );
  } finally {
    vi.useRealTimers();
  }
});
it("explicit defaultOpen false opts out of auto-open even while streaming", () => {
  render(
    <PanelUIProvider reducedMotion>
      <Reasoning isStreaming defaultOpen={false}>
        <Reasoning.Trigger />
        <Reasoning.Content>closed trace</Reasoning.Content>
      </Reasoning>
    </PanelUIProvider>
  );
  expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
    "false"
  );
});
it("finished traces never auto-close unless they actually streamed", () => {
  vi.useFakeTimers();
  try {
    render(
      <PanelUIProvider reducedMotion>
        <Reasoning defaultOpen duration={1}>
          <Reasoning.Trigger />
        </Reasoning>
      </PanelUIProvider>
    );
    expect(screen.getByText("Thought for 1 second")).toBeTruthy();
    act(() => vi.advanceTimersByTime(5000));
    expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
      "true"
    );
  } finally {
    vi.useRealTimers();
  }
});
it("controlled requests and custom string labels preserve the caller's state", () => {
  const state = vi.fn();
  const click = vi.fn();
  const label = vi.fn(() => "Custom label");
  render(
    <PanelUIProvider reducedMotion>
      <Reasoning open={false} duration={8} onOpenChange={state}>
        <Reasoning.Trigger label={label} onClick={click} />
      </Reasoning>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button"));
  expect(state).toHaveBeenCalledWith(true);
  expect(click).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("button").getAttribute("aria-expanded")).toBe(
    "false"
  );
  expect(label).toHaveBeenCalledWith(false, 8);
  expect(screen.getByText("Custom label").tagName).toBe("SPAN");
});
const Probe = ({ onMount }: { onMount: () => void }) => {
  useEffect(onMount, [onMount]);
  return <span>persistent</span>;
};
it("folded contents stay mounted and streaming timers are cancelled on unmount", () => {
  vi.useFakeTimers();
  try {
    const mount = vi.fn();
    const { unmount } = render(
      <PanelUIProvider reducedMotion>
        <Reasoning>
          <Reasoning.Trigger />
          <Reasoning.Content>
            <Probe onMount={mount} />
          </Reasoning.Content>
        </Reasoning>
      </PanelUIProvider>
    );
    expect(mount).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("button"));
    expect(mount).toHaveBeenCalledTimes(1);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
