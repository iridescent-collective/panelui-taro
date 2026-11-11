// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { StackCard, useStackCard } from "../src/components/StackCard";
import type {
  StackCardDirection,
  StackCardHandle,
} from "../src/components/StackCard";
import {
  exitTarget,
  releasedDirection,
  releaseProgress,
} from "../src/components/StackCard/geometry";
import FIXTURES from "./fixtures/stack-card-source.json";
import { setTestMeasurement } from "./taro-api";

const touch = (x: number) => ({ clientX: x, clientY: 100, identifier: 1 });
it.each(FIXTURES.frames)(
  "matches source release $allowed/$x/$y/$vx/$vy/$width",
  ({ allowed, x, y, vx, vy, width, height, threshold, output, progress }) => {
    expect(
      releasedDirection(
        allowed as StackCardDirection[],
        x,
        y,
        vx,
        vy,
        width,
        height,
        threshold
      )
    ).toBe(output);
    expect(
      releaseProgress(
        allowed as StackCardDirection[],
        x,
        y,
        width,
        height,
        threshold
      )
    ).toBeCloseTo(progress, 10);
  }
);
it.each(FIXTURES.exits)(
  "matches source exit $direction/$x/$y",
  ({ direction, x, y, output }) => {
    expect(exitTarget(direction as StackCardDirection, 320, 420, x, y)).toEqual(
      output
    );
  }
);
const Status = () => {
  const { index, canUndo, remaining } = useStackCard();
  return (
    <span data-testid="deck-state">
      {JSON.stringify({ canUndo, index, remaining })}
    </span>
  );
};
const cards = [
  <StackCard.Card key="one">One</StackCard.Card>,
  <StackCard.Card key="two">Two</StackCard.Card>,
  <StackCard.Empty key="empty">Done</StackCard.Empty>,
  <Status key="status" />,
  <StackCard.Actions key="actions">
    <StackCard.Action action="right" label="Accept" />
    <StackCard.Action action="undo" />
  </StackCard.Actions>,
];
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};
it("preserves reduced-motion fade, reports after exit, supports undo/reset and only reports empty once", async () => {
  vi.useFakeTimers();
  const ref = createRef<StackCardHandle>();
  const swipe = vi.fn();
  const empty = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <StackCard ref={ref} onSwipe={swipe} onEmpty={empty}>
        {cards}
      </StackCard>
    </PanelUIProvider>
  );
  await flush();
  act(() => ref.current?.swipe("right"));
  expect(swipe).not.toHaveBeenCalled();
  await act(() => vi.advanceTimersByTime(160));
  expect(swipe).toHaveBeenLastCalledWith("right", 0);
  expect(screen.getByTestId("deck-state").textContent).toContain('"index":1');
  fireEvent.click(screen.getByRole("button", { name: "Undo" }));
  expect(screen.getByTestId("deck-state").textContent).toContain('"index":0');
  act(() => ref.current?.swipe("left"));
  await act(() => vi.advanceTimersByTime(160));
  act(() => ref.current?.swipe("up"));
  await act(() => vi.advanceTimersByTime(160));
  expect(empty).toHaveBeenCalledOnce();
  act(() => ref.current?.reset());
  expect(screen.getByTestId("deck-state").textContent).toContain('"index":0');
  view.unmount();
  vi.useRealTimers();
});
it("restores a controlled index refusal and ignores rapid duplicate sends", async () => {
  vi.useFakeTimers();
  const ref = createRef<StackCardHandle>();
  const change = vi.fn();
  const swipe = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <StackCard ref={ref} index={0} onIndexChange={change} onSwipe={swipe}>
        {cards}
      </StackCard>
    </PanelUIProvider>
  );
  await flush();
  act(() => {
    ref.current?.swipe("right");
    ref.current?.swipe("left");
  });
  await act(() => vi.advanceTimersByTime(160));
  expect(swipe).toHaveBeenCalledOnce();
  expect(change).toHaveBeenLastCalledWith(1);
  expect(screen.getByTestId("deck-state").textContent).toContain('"index":0');
  act(() => ref.current?.swipe("left"));
  await act(() => vi.advanceTimersByTime(160));
  expect(swipe).toHaveBeenLastCalledWith("left", 0);
  view.unmount();
  vi.useRealTimers();
});
it("tracks real native touch, cancels multi-touch and a disabled deck cannot be clicked", async () => {
  vi.useFakeTimers();
  setTestMeasurement(320, 375);
  const swipe = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <StackCard onSwipe={swipe} pileClassName="test-pile">
        {cards}
      </StackCard>
    </PanelUIProvider>
  );
  await flush();
  const pile = document.querySelector(".test-pile");
  if (!pile) {
    throw new Error("Missing pile");
  }

  act(() =>
    fireEvent.touchStart(pile, {
      touches: [touch(20)],
    })
  );
  act(() => {
    vi.advanceTimersByTime(20);
    fireEvent.touchMove(pile, {
      touches: [touch(40)],
    });
  });
  act(() => {
    vi.advanceTimersByTime(20);
    fireEvent.touchMove(pile, {
      touches: [touch(170)],
    });
  });
  act(() =>
    fireEvent.touchEnd(pile, {
      changedTouches: [touch(170)],
    })
  );
  await act(() => vi.advanceTimersByTime(160));
  expect(swipe).toHaveBeenLastCalledWith("right", 0);
  view.rerender(
    <PanelUIProvider reducedMotion>
      <StackCard disabled onSwipe={swipe}>
        {cards}
      </StackCard>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Accept" }));
  expect(swipe).toHaveBeenCalledOnce();
  view.unmount();
  vi.useRealTimers();
});
it("reset cancels pending exit and multi-touch cancels a held drag", async () => {
  vi.useFakeTimers();
  const ref = createRef<StackCardHandle>();
  const swipe = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <StackCard ref={ref} onSwipe={swipe} pileClassName="cancel-pile">
        {cards}
      </StackCard>
    </PanelUIProvider>
  );
  await flush();
  act(() => ref.current?.swipe("left"));
  act(() => ref.current?.reset());
  act(() => vi.advanceTimersByTime(600));
  expect(swipe).not.toHaveBeenCalled();
  const pile = document.querySelector(".cancel-pile");
  if (!pile) {
    throw new Error("Missing pile");
  }
  fireEvent.touchStart(pile, { touches: [touch(20)] });
  fireEvent.touchMove(pile, { touches: [touch(40)] });
  fireEvent.touchMove(pile, {
    touches: [touch(170), { ...touch(180), identifier: 2 }],
  });
  fireEvent.touchEnd(pile, { changedTouches: [touch(170)] });
  act(() => vi.advanceTimersByTime(600));
  expect(swipe).not.toHaveBeenCalled();
  view.unmount();
  vi.useRealTimers();
});
