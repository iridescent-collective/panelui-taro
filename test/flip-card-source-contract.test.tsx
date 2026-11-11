// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { FlipCard, useFlipCard } from "../src/components/FlipCard";
import { PanelUIProvider } from "../src/components/Provider";
import { setElementMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const HookControl = () => {
  const { flipped, flip } = useFlipCard();
  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        flip();
      }}
    >
      {flipped ? "Front" : "Back"}
    </button>
  );
};
const touches = (x: number, y = 0) => [
  { clientX: x, clientY: y, identifier: 1 },
];
const frontFrame = (root: HTMLElement) => root.children[0] as HTMLElement;
const backFrame = (root: HTMLElement) => root.children[1] as HTMLElement;
it("press changes target accessibility once while keeping both faces mounted", () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <FlipCard data-testid="card" onFlippedChange={change}>
        <FlipCard.Back>Answer</FlipCard.Back>
        <FlipCard.Front>Question</FlipCard.Front>
      </FlipCard>
    </PanelUIProvider>
  );
  const card = screen.getByTestId("card");
  for (const label of ["Question", "Answer"]) {
    const face = screen.getByText(label);
    expect(face.classList.contains("flex")).toBe(true);
    expect(face.classList.contains("flex-col")).toBe(true);
  }
  expect(card.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(card);
  expect(change).toHaveBeenCalledWith(true);
  expect(card.getAttribute("aria-expanded")).toBe("true");
  expect(frontFrame(card).getAttribute("aria-hidden")).toBe("true");
  expect(backFrame(card).style.opacity).toBe("1");
  expect(screen.getByText("Question")).toBeTruthy();
});
it("external hook controls a none-trigger card and supports the opposite rotation axis", () => {
  render(
    <PanelUIProvider reducedMotion>
      <FlipCard
        trigger="none"
        direction="vertical"
        rotation="reverse"
        data-testid="card"
      >
        <FlipCard.Front>
          <HookControl />
        </FlipCard.Front>
        <FlipCard.Back>Answer</FlipCard.Back>
      </FlipCard>
    </PanelUIProvider>
  );
  const card = screen.getByTestId("card");
  expect(card.getAttribute("role")).toBeNull();
  fireEvent.click(card);
  expect(card.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  expect(card.getAttribute("aria-expanded")).toBe("true");
  expect(readTaroStyle(frontFrame(card))).toContain("rotateX(-180deg)");
});
it("controlled press refusal keeps the original face and missing parts are not fabricated", () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <FlipCard flipped={false} onFlippedChange={change} data-testid="card">
        <FlipCard.Front>Only front</FlipCard.Front>
        <span>Ignored child</span>
      </FlipCard>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByTestId("card"));
  expect(change).toHaveBeenCalledWith(true);
  expect(screen.getByTestId("card").getAttribute("aria-expanded")).toBe(
    "false"
  );
  expect(screen.queryByText("Ignored child")).toBeNull();
});
it("defaultFlipped is only an initializer and later changes do not turn an uncontrolled card", () => {
  vi.useFakeTimers();
  try {
    const tree = render(
      <PanelUIProvider>
        <FlipCard defaultFlipped data-testid="card">
          <FlipCard.Front>Question</FlipCard.Front>
          <FlipCard.Back>Answer</FlipCard.Back>
        </FlipCard>
      </PanelUIProvider>
    );
    tree.rerender(
      <PanelUIProvider>
        <FlipCard defaultFlipped={false} data-testid="card">
          <FlipCard.Front>Question</FlipCard.Front>
          <FlipCard.Back>Answer</FlipCard.Back>
        </FlipCard>
      </PanelUIProvider>
    );
    act(() => vi.advanceTimersByTime(2000));
    const card = screen.getByTestId("card");
    expect(card.getAttribute("aria-expanded")).toBe("true");
    expect(backFrame(card).style.opacity).toBe("1");
  } finally {
    vi.useRealTimers();
  }
});
it("drag uses source 0.66 span and snaps to the selected face without a trailing click flip", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("flip-drag", {
      height: 100,
      left: 0,
      top: 0,
      width: 200,
    });
    const change = vi.fn();
    render(
      <PanelUIProvider>
        <FlipCard
          id="flip-drag"
          trigger="drag"
          data-testid="card"
          onFlippedChange={change}
        >
          <FlipCard.Front>Question</FlipCard.Front>
          <FlipCard.Back>Answer</FlipCard.Back>
        </FlipCard>
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    const card = screen.getByTestId("card");
    fireEvent.touchStart(card, { touches: touches(0) });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.touchMove(card, { touches: touches(90) });
    fireEvent.touchEnd(card, { changedTouches: touches(90), touches: [] });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => vi.advanceTimersByTime(2000));
    expect(change).toHaveBeenCalledWith(true);
    expect(card.getAttribute("aria-expanded")).toBe("true");
    expect(readTaroStyle(backFrame(card))).toContain("rotateY(0deg)");
    fireEvent.click(card);
    expect(change).toHaveBeenCalledOnce();
  } finally {
    vi.useRealTimers();
  }
});
it("short drag and controlled rejection settle back instead of staying halfway", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("flip-reject", {
      height: 100,
      left: 0,
      top: 0,
      width: 200,
    });
    const tree = render(
      <PanelUIProvider>
        <FlipCard id="flip-reject" trigger="drag" data-testid="card">
          <FlipCard.Front>Question</FlipCard.Front>
          <FlipCard.Back>Answer</FlipCard.Back>
        </FlipCard>
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    const card = screen.getByTestId("card");
    fireEvent.touchStart(card, { touches: touches(0) });
    act(() => vi.advanceTimersByTime(500));
    fireEvent.touchMove(card, { touches: touches(20) });
    fireEvent.touchEnd(card, { changedTouches: touches(20) });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => vi.advanceTimersByTime(2000));
    expect(readTaroStyle(frontFrame(card))).toContain("rotateY(0deg)");
    tree.rerender(
      <PanelUIProvider>
        <FlipCard
          id="flip-reject"
          trigger="drag"
          flipped={false}
          data-testid="card"
        >
          <FlipCard.Front>Question</FlipCard.Front>
          <FlipCard.Back>Answer</FlipCard.Back>
        </FlipCard>
      </PanelUIProvider>
    );
    fireEvent.touchStart(card, { touches: touches(0) });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.touchMove(card, { touches: touches(90) });
    fireEvent.touchEnd(card, { changedTouches: touches(90) });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => vi.advanceTimersByTime(2000));
    expect(readTaroStyle(frontFrame(card))).toContain("rotateY(0deg)");
  } finally {
    vi.useRealTimers();
  }
});
it("a short positive flick commits while cancellation restores the accepted face", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("flip-flick", {
      height: 100,
      left: 0,
      top: 0,
      width: 200,
    });
    const change = vi.fn();
    const tree = render(
      <PanelUIProvider>
        <FlipCard
          id="flip-flick"
          trigger="drag"
          data-testid="card"
          onFlippedChange={change}
        >
          <FlipCard.Front>Question</FlipCard.Front>
          <FlipCard.Back>Answer</FlipCard.Back>
        </FlipCard>
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    const card = screen.getByTestId("card");
    fireEvent.touchStart(card, { touches: touches(0) });
    act(() => vi.advanceTimersByTime(16));
    fireEvent.touchMove(card, { touches: touches(20) });
    fireEvent.touchEnd(card, { changedTouches: touches(20) });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => vi.advanceTimersByTime(2000));
    expect(card.getAttribute("aria-expanded")).toBe("true");
    fireEvent.touchStart(card, { touches: touches(100) });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.touchMove(card, { touches: touches(10) });
    fireEvent.touchCancel(card);
    act(() => vi.advanceTimersByTime(2000));
    expect(backFrame(card).style.opacity).toBe("1");
    expect(change).toHaveBeenCalledOnce();
    tree.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("changing the gesture configuration cancels an in-flight drag and restores the accepted face", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("flip-config", {
      height: 100,
      left: 0,
      top: 0,
      width: 200,
    });
    const tree = render(
      <PanelUIProvider>
        <FlipCard id="flip-config" trigger="drag" data-testid="card">
          <FlipCard.Front>Question</FlipCard.Front>
          <FlipCard.Back>Answer</FlipCard.Back>
        </FlipCard>
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    const card = screen.getByTestId("card");
    fireEvent.touchStart(card, { touches: touches(0) });
    fireEvent.touchMove(card, { touches: touches(40) });
    tree.rerender(
      <PanelUIProvider>
        <FlipCard id="flip-config" trigger="none" data-testid="card">
          <FlipCard.Front>Question</FlipCard.Front>
          <FlipCard.Back>Answer</FlipCard.Back>
        </FlipCard>
      </PanelUIProvider>
    );
    act(() => vi.advanceTimersByTime(2000));
    expect(readTaroStyle(frontFrame(card))).toContain("rotateY(0deg)");
  } finally {
    vi.useRealTimers();
  }
});
