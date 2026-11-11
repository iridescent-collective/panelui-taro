// @vitest-environment happy-dom
import "./geometry-renderer";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { Camera, useCamera } from "../src/components/Camera";
import type { CameraHandle } from "../src/components/Camera";
import { PanelUIProvider } from "../src/components/Provider";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const ZoomValue = () => <span>zoom={useCamera().zoom}</span>;

it("keeps native zoom adjustment and selected stops connected to the custom scale", async () => {
  const changed = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Camera defaultZoom={0.5} onZoomChange={changed}>
        <Camera.Zoom
          stops={[
            { label: "1×", value: 0 },
            { label: "2×", value: 0.5 },
          ]}
        />
        <ZoomValue />
      </Camera>
    </PanelUIProvider>
  );
  const control = screen.getByLabelText("Zoom");
  expect(
    screen
      .getByRole("button", { name: "Zoom 2×" })
      .getAttribute("aria-selected")
  ).toBe("true");
  fireEvent.touchStart(control, {
    touches: [{ identifier: 1, clientX: 40, clientY: 10 }],
  });
  act(() =>
    dispatchTaroEvent(control, TARO_TEST_EVENTS.pickerChange, { value: 25 })
  );
  expect(screen.getByText("zoom=0.25")).toBeTruthy();
  expect(changed).toHaveBeenLastCalledWith(0.25);
  fireEvent.click(screen.getByRole("button", { name: "Zoom 1×" }));
  await waitFor(() => expect(screen.queryByLabelText("Zoom")).toBeNull());
  expect(
    screen
      .getByRole("button", { name: "Zoom 1×" })
      .getAttribute("aria-selected")
  ).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "Zoom 2×" }));
  expect(screen.getByLabelText("Zoom")).toBeTruthy();
});

it("restores full shutter ring geometry and the stopped recording disc", async () => {
  const ref = createRef<CameraHandle>();
  const tree = render(
    <PanelUIProvider reducedMotion>
      <Camera ref={ref} defaultMode="video" maxDuration={3}>
        <Camera.Preview />
        <Camera.Shutter />
        <Camera.Duration />
      </Camera>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const preview = tree.container.querySelector("section");
  if (!preview) throw new Error("Missing preview");
  act(() =>
    dispatchTaroEvent(preview, TARO_TEST_EVENTS.cameraInit, { maxZoom: 5 })
  );
  const ringImage = Array.from(tree.container.querySelectorAll("img")).find(
    (img) =>
      decodeURIComponent(img.getAttribute("src") ?? "").includes(
        'viewBox="0 0 78 78"'
      )
  );
  const ring = decodeURIComponent(ringImage?.getAttribute("src") ?? "");
  expect(readTaroStyle(ringImage)).toContain('"width":"156rpx"');
  expect(readTaroStyle(ringImage)).toContain('"height":"156rpx"');
  expect(ring).toContain('stroke-linecap="round"');
  let done: Promise<void> | undefined;
  await act(async () => {
    done = ref.current?.startRecording();
    await Promise.resolve();
  });
  const shutter = screen.getByRole("button", { name: "Stop recording" });
  const disc = Array.from(shutter.children).find((node) =>
    node.className.includes("bg-[var(--panel-destructive)]")
  );
  expect(readTaroStyle(disc)).toContain('"borderRadius":"16rpx"');
  expect(readTaroStyle(disc)).toContain('"width":"56rpx"');
  await act(async () => {
    ref.current?.stopRecording();
    await done;
  });
  expect(screen.getByRole("button", { name: "Record video" })).toBeTruthy();
});
