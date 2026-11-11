// @vitest-environment happy-dom
import { act, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { ColorPicker } from "../src/components/ColorPicker";
import { PanelUIProvider } from "../src/components/Provider";
import { SlideButton } from "../src/components/SlideButton";
import { Slider } from "../src/components/Slider";
import { setTestMeasurement } from "./taro-api";

const point = (clientX: number) => [{ clientX, clientY: 10, identifier: 1 }];
it("controlled Slider keeps native capture stable through several moves and commits on release", async () => {
  setTestMeasurement(300, 375);
  const change = vi.fn();
  const commit = vi.fn();
  const Sample = () => {
    const [value, setValue] = useState(20);
    return (
      <Slider
        value={value}
        trackClassName="drag-track"
        onValueChange={(next) => {
          change(next);
          setValue(next);
        }}
        onValueCommit={commit}
      />
    );
  };
  const view = render(
    <PanelUIProvider reducedMotion>
      <Sample />
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const track = view.container.querySelector<HTMLElement>(".drag-track")!;
  expect(track.dataset.taroCatchMove).toBe("true");
  fireEvent.touchStart(track, { touches: point(60) });
  for (const x of [90, 120, 180, 240]) {
    fireEvent.touchMove(track, { touches: point(x) });
    expect(track.dataset.taroCatchMove).toBe("true");
  }
  expect(change).toHaveBeenCalledTimes(4);
  expect(commit).not.toHaveBeenCalled();
  fireEvent.touchEnd(track, { changedTouches: point(240) });
  expect(commit).toHaveBeenCalledOnce();
  expect(track.dataset.taroCatchMove).toBe("true");
});

it.each([false, true])(
  "drag controls choose their native capture template before touch (disabled: %s)",
  (disabled) => {
    const view = render(
      <PanelUIProvider reducedMotion>
        <Slider disabled={disabled} trackClassName="capture-slider" />
        <SlideButton disabled={disabled}>Confirm</SlideButton>
        <ColorPicker disabled={disabled}>
          <ColorPicker.Hue />
          <ColorPicker.Brightness />
          <ColorPicker.Alpha />
        </ColorPicker>
      </PanelUIProvider>
    );
    const surfaces = [
      view.container.querySelector(".capture-slider"),
      view.container.querySelector(".panelui-slide-surface"),
      ...view.container.querySelectorAll(
        '[aria-label="Hue"], [aria-label="Brightness"], [aria-label="Opacity"]'
      ),
    ];
    expect(surfaces).toHaveLength(5);
    for (const surface of surfaces)
      expect(surface?.getAttribute("data-taro-catch-move")).toBe(
        String(!disabled)
      );
  }
);
