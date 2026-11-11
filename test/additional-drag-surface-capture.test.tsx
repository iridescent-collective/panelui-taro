// @vitest-environment happy-dom
import { act, fireEvent, render } from "@testing-library/react";
import { expect, it } from "vitest";

import { AvatarCropper } from "../src/components/AvatarCropper";
import { ProgressButton } from "../src/components/ProgressButton";
import { PanelUIProvider } from "../src/components/Provider";
import { toast } from "../src/components/Toast";
import { setTestMeasurement } from "./taro-api";

const point = (clientX: number) => [{ clientX, clientY: 10, identifier: 1 }];

it("AvatarCropper keeps its native touch host while panning and pinching", async () => {
  setTestMeasurement(300, 300);
  const view = render(
    <PanelUIProvider reducedMotion>
      <AvatarCropper
        source={{ uri: "wxfile://portrait.jpg", width: 800, height: 600 }}
      >
        <AvatarCropper.Canvas id="capture-crop" />
      </AvatarCropper>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const surface = view.container.querySelector<HTMLElement>("#capture-crop")!;
  expect(surface.dataset.taroCatchMove).toBe("true");
  fireEvent.touchStart(surface, { touches: point(60) });
  for (const x of [90, 120, 180]) {
    fireEvent.touchMove(surface, { touches: point(x) });
    expect(surface.dataset.taroCatchMove).toBe("true");
  }
  fireEvent.touchCancel(surface);
  const pinch = (span: number) => [
    { clientX: 150 - span, clientY: 150, identifier: 1 },
    { clientX: 150 + span, clientY: 150, identifier: 2 },
  ];
  fireEvent.touchStart(surface, { touches: pinch(30) });
  fireEvent.touchMove(surface, { touches: pinch(60) });
  expect(surface.dataset.taroCatchMove).toBe("true");
  fireEvent.touchEnd(surface, { changedTouches: pinch(60) });
  expect(surface.dataset.taroCatchMove).toBe("true");
});

it.each([false, true])(
  "ProgressButton chooses its touch host before hold begins (disabled: %s)",
  async (disabled) => {
    setTestMeasurement(300, 100);
    const view = render(
      <PanelUIProvider reducedMotion>
        <ProgressButton disabled={disabled} accessibilityLabel="Hold capture" />
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    const surface = view.getByRole("button", { name: "Hold capture" });
    expect(surface.dataset.taroCatchMove).toBe(String(!disabled));
    fireEvent.touchStart(surface, { touches: point(60) });
    await act(async () => {
      await Promise.resolve();
    });
    expect(surface.dataset.taroCatchMove).toBe(String(!disabled));
    fireEvent.touchCancel(surface);
    expect(surface.dataset.taroCatchMove).toBe(String(!disabled));
  }
);

it("Toast keeps capture stable across the swipe threshold and dismisses on release", async () => {
  render(<PanelUIProvider reducedMotion />);
  act(() => {
    toast.show({ label: "Swipe capture", duration: 0 });
  });
  await act(async () => {
    await Promise.resolve();
  });
  const surface = document.querySelector(
    "[data-taro-catch-move]"
  ) as HTMLElement;
  expect(surface.dataset.taroCatchMove).toBe("true");
  const at = (y: number) => [{ clientX: 50, clientY: y, identifier: 1 }];
  fireEvent.touchStart(surface, { touches: at(10) });
  for (const y of [25, 40, 80]) {
    fireEvent.touchMove(surface, { touches: at(y) });
    expect(surface.dataset.taroCatchMove).toBe("true");
  }
  fireEvent.touchEnd(surface, { changedTouches: at(80) });
  expect(surface.dataset.taroCatchMove).toBe("false");
  act(() => toast.hideAll());
});
