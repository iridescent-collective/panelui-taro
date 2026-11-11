// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Tour } from "../src/components/Tour";
import type { TourPlacement, TourShape } from "../src/components/Tour";
import {
  currentTourCardHeight,
  nextTourCardMeasurement,
} from "../src/components/Tour/card-measurement";
import {
  cardFrame,
  cutoutPath,
  spotlightFor,
} from "../src/components/Tour/geometry";
import FIXTURES from "./fixtures/tour-source.json";
import { setTestMeasurement } from "./taro-api";

it.each(FIXTURES.spots)(
  "matches source spotlight/path $shape/$padding/$radius",
  ({ rect, shape, padding, radius, output, path }) => {
    const spot = spotlightFor(rect, shape as TourShape, padding, radius);
    expect(spot).toEqual(output);
    expect(
      cutoutPath(375, 667, spot.x, spot.y, spot.width, spot.height, spot.radius)
    ).toBe(path);
  }
);
it.each(FIXTURES.frames)(
  "matches source card safe placement $input.placement/$input.cardHeight/$input.screenWidth",
  ({ input, output }) => {
    expect(
      cardFrame({ ...input, placement: input.placement as TourPlacement })
    ).toEqual(output);
  }
);
const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const steps = [
  <Tour.Step key="later" order={30} title="Third" description="Final step">
    Target three
  </Tour.Step>,
  <Tour.Step key="first" order={10} title="First">
    Target one
  </Tour.Step>,
  <Tour.Step key="second" order={20} title="Second" shape="circle">
    Target two
  </Tour.Step>,
];
it("sorts registration, advances numeric order, goes back and finishes once", async () => {
  setTestMeasurement(100, 375);
  const finish = vi.fn();
  const change = vi.fn();
  const open = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Tour
        defaultOpen
        onFinish={finish}
        onStepChange={change}
        onOpenChange={open}
      >
        {steps}
      </Tour>
    </PanelUIProvider>
  );
  await flush();
  expect(screen.getByText("First")).toBeTruthy();
  expect(screen.getByText("1 of 3")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await flush();
  expect(change).toHaveBeenLastCalledWith(20);
  expect(screen.getByText("Second")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Back" }));
  await flush();
  expect(change).toHaveBeenLastCalledWith(10);
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await flush();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await flush();
  expect(screen.getByText("Third")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Skip" })).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(finish).toHaveBeenCalledOnce();
  expect(open).toHaveBeenLastCalledWith(false);
});
it("controlled step stays put until accepted and non-dismissible tours hide close/backdrop skip", async () => {
  const step = vi.fn();
  const skip = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <Tour
        open
        step={10}
        dismissible={false}
        showSkip={false}
        onStepChange={step}
        onSkip={skip}
      >
        {steps}
      </Tour>
    </PanelUIProvider>
  );
  await flush();
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  expect(step).toHaveBeenLastCalledWith(20);
  expect(screen.getByText("First")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "End tour" })).toBeNull();
  view.rerender(
    <PanelUIProvider reducedMotion>
      <Tour open step={20} interactive onStepChange={step}>
        {steps}
      </Tour>
    </PanelUIProvider>
  );
  await flush();
  expect(screen.getByText("Second")).toBeTruthy();
  expect(skip).not.toHaveBeenCalled();
});
it("ties layout height to source step owner and ignores subpixel noise", () => {
  const first = {};
  const second = {};
  const measured = nextTourCardMeasurement(first, 300, null);
  expect(currentTourCardHeight(first, measured)).toBe(300);
  expect(currentTourCardHeight(second, measured)).toBeNull();
  expect(nextTourCardMeasurement(first, 300.5, measured)).toBe(measured);
  expect(nextTourCardMeasurement(second, 20, measured).height).toBe(20);
});
