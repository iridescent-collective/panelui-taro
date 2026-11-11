// @vitest-environment happy-dom

import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { FlipCard, useFlipCard } from "../src/components/FlipCard";
import { PanelUIProvider } from "../src/components/Provider";

const ActivateCard = () => {
  const { flip } = useFlipCard();
  return (
    <button
      onClick={(event) => {
        event.stopPropagation();
        flip();
      }}
    >
      Activate card
    </button>
  );
};

it("does not turn a drag-trigger card on an ordinary click", () => {
  const change = vi.fn();
  const click = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <FlipCard
        trigger="drag"
        data-testid="card"
        onFlippedChange={change}
        onClick={click}
      >
        <FlipCard.Front>Question</FlipCard.Front>
        <FlipCard.Back>Answer</FlipCard.Back>
      </FlipCard>
    </PanelUIProvider>
  );
  const card = screen.getByTestId("card");
  fireEvent.click(card);
  expect(click).toHaveBeenCalledTimes(1);
  expect(change).not.toHaveBeenCalled();
  expect(card.getAttribute("aria-expanded")).toBe("false");
});

it("keeps explicit hook activation available for a drag-trigger card", () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <FlipCard trigger="drag" data-testid="card" onFlippedChange={change}>
        <FlipCard.Front>
          <ActivateCard />
        </FlipCard.Front>
        <FlipCard.Back>Answer</FlipCard.Back>
      </FlipCard>
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Activate card" }));
  expect(change).toHaveBeenCalledExactlyOnceWith(true);
  expect(screen.getByTestId("card").getAttribute("aria-expanded")).toBe("true");
});

it.each(["press", "none"] as const)(
  "keeps %s click-trigger behavior unchanged",
  (trigger) => {
    const change = vi.fn();
    render(
      <PanelUIProvider reducedMotion>
        <FlipCard trigger={trigger} data-testid="card" onFlippedChange={change}>
          <FlipCard.Front>Question</FlipCard.Front>
          <FlipCard.Back>Answer</FlipCard.Back>
        </FlipCard>
      </PanelUIProvider>
    );
    fireEvent.click(screen.getByTestId("card"));
    expect(change).toHaveBeenCalledTimes(trigger === "press" ? 1 : 0);
    expect(screen.getByTestId("card").getAttribute("aria-expanded")).toBe(
      String(trigger === "press")
    );
  }
);
