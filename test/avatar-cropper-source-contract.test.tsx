// @vitest-environment happy-dom

import * as taroApi from "@tarojs/taro";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import {
  AvatarCropper,
  pickAvatarImage,
} from "../src/components/AvatarCropper";
import type { AvatarCropperHandle } from "../src/components/AvatarCropper";
import { drawAvatarCrop } from "../src/components/AvatarCropper/native";
import type { CropCanvasContext } from "../src/components/AvatarCropper/native";
import { PanelUIProvider } from "../src/components/Provider";
import { deferred } from "./helpers/deferred";
import {
  canvasToTempFilePath,
  setElementCanvasNode,
  setElementMeasurement,
  showActionSheet,
} from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

const native = vi.hoisted(() => ({
  choose: vi.fn(() =>
    Promise.resolve({
      tempFiles: [{ tempFilePath: "wxfile://chosen.jpg" }],
    })
  ),
  info: vi.fn(({ src }: { src: string }) =>
    Promise.resolve({
      height: 600,
      path: src,
      width: 800,
    })
  ),
}));
vi.mock("@tarojs/taro", async (original) => ({
  ...(await original<object>()),
  chooseMedia: native.choose,
  getImageInfo: native.info,
}));
const photo = { height: 600, uri: "wxfile://portrait.jpg", width: 800 };
const settle = () =>
  act(async () => {
    await Promise.resolve();
  });
const model = (
  ref: ReturnType<typeof createRef<AvatarCropperHandle>>,
  source = photo,
  cover = true
) => (
  <PanelUIProvider reducedMotion>
    <AvatarCropper source={source} cover={cover} ref={ref}>
      <AvatarCropper.Canvas id="crop-surface" />
      <AvatarCropper.Reset />
      <AvatarCropper.Rotate />
      <AvatarCropper.Rotate direction="counterclockwise" />
    </AvatarCropper>
  </PanelUIProvider>
);

const p = (identifier: number, x: number, y: number) => ({
  clientX: x,
  clientY: y,
  identifier,
});
it("measures the canvas and supports both quarter turns, reset and source replacement", async () => {
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 0,
    top: 0,
    width: 300,
  });
  const ref = createRef<AvatarCropperHandle>();
  const view = render(model(ref));
  await settle();
  expect(ref.current?.getCrop()).toMatchObject({
    height: 600,
    rotation: 0,
    width: 600,
  });
  fireEvent.click(screen.getByRole("button", { name: "Rotate clockwise" }));
  expect(ref.current?.getCrop()?.rotation).toBe(90);
  expect(
    screen.getByLabelText("Photo crop").getAttribute("aria-valuetext")
  ).toContain("turned 90 degrees");
  fireEvent.click(
    screen.getByRole("button", { name: "Rotate counterclockwise" })
  );
  expect(ref.current?.getCrop()?.rotation).toBe(0);
  act(() => ref.current?.rotate());
  fireEvent.click(screen.getByRole("button", { name: "Reset" }));
  expect(ref.current?.getCrop()?.rotation).toBe(0);
  act(() => ref.current?.rotate());
  view.rerender(model(ref, { ...photo, uri: "wxfile://new.jpg" }));
  await settle();
  expect(ref.current?.getCrop()?.rotation).toBe(0);
});
it("drags, pinches and twists in one surface, settles on lift and permits zoom-out when cover is off", async () => {
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 0,
    top: 0,
    width: 300,
  });
  const ref = createRef<AvatarCropperHandle>();
  render(model(ref, photo, false));
  await settle();
  const surface = screen.getByLabelText("Photo crop");
  fireEvent.touchStart(surface, { touches: [p(1, 50, 150), p(2, 250, 150)] });
  await settle();
  fireEvent.touchMove(surface, { touches: [p(1, 150, 125), p(2, 150, 175)] });
  fireEvent.touchEnd(surface, { touches: [] });
  expect(surface.getAttribute("aria-valuetext")).toBe(
    "38% zoom, turned 90 degrees"
  );
  expect(ref.current?.getCrop()?.width).toBe(1600);
});
it("writes an actual square canvas image with the advertised pixel size and format", async () => {
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 0,
    top: 0,
    width: 300,
  });
  const ref = createRef<AvatarCropperHandle>();
  const view = render(model(ref));
  await settle();
  const context = {
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: "",
    rotate: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
  };
  const image = {
    onerror: null as ((error: unknown) => void) | null,
    onload: null as (() => void) | null,
    get src() {
      return "wxfile://portrait.jpg";
    },
    set src(_value: string) {
      queueMicrotask(() => this.onload?.());
    },
  };
  const canvas = {
    createImage: () => image,
    getContext: () => context,
    height: 0,
    width: 0,
  };
  const exportId = view.container.querySelector("canvas")?.id ?? "";
  setElementCanvasNode(exportId, canvas);
  const output = await ref.current?.crop({
    compress: 0.7,
    format: "jpeg",
    size: 256,
  });
  expect(output).toMatchObject({ height: 256, width: 256 });
  expect(context.drawImage).toHaveBeenCalledTimes(1);
  expect(canvas.width).toBe(256);
  expect(canvasToTempFilePath).toHaveBeenCalledWith(
    expect.objectContaining({
      destHeight: 256,
      destWidth: 256,
      fileType: "jpg",
      quality: 0.7,
    }),
    expect.anything()
  );
  await expect(ref.current?.crop({ size: 9000 })).rejects.toThrow("8192");
});
it("rejects export before measurement and missing native Canvas instead of inventing output", async () => {
  setElementMeasurement("crop-surface", null);
  const ref = createRef<AvatarCropperHandle>();
  render(model(ref));
  await settle();
  await expect(ref.current?.crop()).rejects.toThrow("measured");
});
it("paints transparent and colored backgrounds with the same centred transform as the viewport", () => {
  const context = {
    clearRect: vi.fn(),
    drawImage: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: "",
    rotate: vi.fn(),
    scale: vi.fn(),
    translate: vi.fn(),
  } satisfies CropCanvasContext;
  const image = { onerror: null, onload: null, src: "x" };
  drawAvatarCrop(
    context,
    image,
    {
      canvas: { height: 200, width: 100 },
      height: 100,
      originX: -12,
      originY: 8,
      rotation: 90,
      width: 100,
    },
    { height: 100, width: 200 },
    200,
    "transparent"
  );
  expect(context.fillRect).not.toHaveBeenCalled();
  expect(context.translate.mock.calls).toEqual([
    [12, -8],
    [50, 100],
  ]);
  expect(context.scale.mock.calls).toEqual([[2, 2]]);
  expect(context.rotate).toHaveBeenCalledWith(Math.PI / 2);
  expect(context.drawImage).toHaveBeenCalledWith(image, -100, -50, 200, 100);
  drawAvatarCrop(
    context,
    image,
    {
      canvas: { height: 100, width: 100 },
      height: 100,
      originX: 0,
      originY: 0,
      rotation: 0,
      width: 100,
    },
    { height: 100, width: 100 },
    200,
    "#fff"
  );
  expect(context.fillStyle).toBe("#fff");
  expect(context.fillRect).toHaveBeenCalledWith(0, 0, 200, 200);
});
it("uses WeChat media picking, returns dimensions, distinguishes cancellation and denied permission", async () => {
  expect(await pickAvatarImage()).toEqual({
    height: 600,
    uri: "wxfile://chosen.jpg",
    width: 800,
  });
  expect(native.choose).toHaveBeenCalledWith(
    expect.objectContaining({ sizeType: ["original"], sourceType: ["album"] })
  );
  await pickAvatarImage({ from: "camera", quality: 0.8 });
  expect(native.choose).toHaveBeenLastCalledWith(
    expect.objectContaining({
      sizeType: ["compressed"],
      sourceType: ["camera"],
    })
  );
  native.choose.mockRejectedValueOnce({ errMsg: "chooseMedia:fail cancel" });
  expect(await pickAvatarImage()).toBeNull();
  native.choose.mockRejectedValueOnce(new Error("permission denied"));
  await expect(pickAvatarImage({ from: "camera" })).rejects.toThrow(
    "permission denied"
  );
});

it("offers source accessibility zoom and rotate actions through the native action sheet", async () => {
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 0,
    top: 0,
    width: 300,
  });
  const ref = createRef<AvatarCropperHandle>();
  render(model(ref));
  await settle();
  const surface = screen.getByLabelText("Photo crop");
  act(() => dispatchTaroEvent(surface, TARO_TEST_EVENTS.longPress));
  await settle();
  expect(surface.getAttribute("aria-valuetext")).toBe("125% zoom");
  showActionSheet.mockResolvedValueOnce({ tapIndex: 1 });
  act(() => dispatchTaroEvent(surface, TARO_TEST_EVENTS.longPress));
  await settle();
  expect(surface.getAttribute("aria-valuetext")).toBe("100% zoom");
  showActionSheet.mockResolvedValueOnce({ tapIndex: 2 });
  act(() => dispatchTaroEvent(surface, TARO_TEST_EVENTS.longPress));
  await settle();
  expect(ref.current?.getCrop()?.rotation).toBe(90);
});
it("rejects a missing native export canvas after measurement", async () => {
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 0,
    top: 0,
    width: 300,
  });
  const ref = createRef<AvatarCropperHandle>();
  render(model(ref));
  await settle();
  await expect(ref.current?.crop()).rejects.toThrow("Canvas 2D is unavailable");
});

it("ignores an old image measurement after a new photo replaces it", async () => {
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 0,
    top: 0,
    width: 300,
  });
  const first = deferred<{ path: string; width: number; height: number }>();
  const second = deferred<{ path: string; width: number; height: number }>();
  native.info
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const ref = createRef<AvatarCropperHandle>();
  const picture = (uri: string) => (
    <PanelUIProvider reducedMotion>
      <AvatarCropper ref={ref} source={{ uri }}>
        <AvatarCropper.Canvas id="crop-surface" />
      </AvatarCropper>
    </PanelUIProvider>
  );
  const view = render(picture("https://example.com/a.jpg"));
  await settle();
  view.rerender(picture("https://example.com/b.jpg"));
  await settle();
  await act(async () => {
    first.resolve({ height: 100, path: "a.jpg", width: 200 });
    await first.promise;
  });
  expect(ref.current?.getCrop()).toBeNull();
  await act(async () => {
    second.resolve({ height: 600, path: "b.jpg", width: 1200 });
    await second.promise;
  });
  await settle();
  expect(ref.current?.getCrop()).toMatchObject({
    height: 600,
    originX: 300,
    width: 600,
  });
});
it("keeps a failed remote image unmeasured and refuses an invented crop", async () => {
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 0,
    top: 0,
    width: 300,
  });
  native.info.mockRejectedValueOnce(new Error("download domain rejected"));
  const ref = createRef<AvatarCropperHandle>();
  render(
    <PanelUIProvider reducedMotion>
      <AvatarCropper
        ref={ref}
        source={{ uri: "https://example.com/blocked.jpg" }}
      >
        <AvatarCropper.Canvas id="crop-surface" />
      </AvatarCropper>
    </PanelUIProvider>
  );
  await settle();
  expect(ref.current?.getCrop()).toBeNull();
  await expect(ref.current?.crop()).rejects.toThrow("measured");
});
it("keeps a centred pinch and twist centred after the parent scrolls 100 pixels", async () => {
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 20,
    top: 200,
    width: 300,
  });
  const ref = createRef<AvatarCropperHandle>();
  render(model(ref));
  await settle();
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 20,
    top: 100,
    width: 300,
  });
  const surface = screen.getByLabelText("Photo crop");
  fireEvent.touchStart(surface, { touches: [p(1, 120, 250), p(2, 220, 250)] });
  await settle();
  fireEvent.touchMove(surface, { touches: [p(1, 170, 150), p(2, 170, 350)] });
  fireEvent.touchEnd(surface, { touches: [] });
  expect(ref.current?.getCrop()).toMatchObject({
    height: 300,
    originX: 150,
    originY: 250,
    rotation: 90,
    width: 300,
  });
});

it("buffers movement until fresh measurement arrives without using the stale centre", async () => {
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 20,
    top: 200,
    width: 300,
  });
  const ref = createRef<AvatarCropperHandle>();
  render(model(ref));
  await settle();
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 20,
    top: 100,
    width: 300,
  });
  const surface = screen.getByLabelText("Photo crop");
  fireEvent.touchStart(surface, { touches: [p(1, 120, 250), p(2, 220, 250)] });
  fireEvent.touchMove(surface, { touches: [p(1, 170, 150), p(2, 170, 350)] });
  await settle();
  fireEvent.touchEnd(surface, { touches: [] });
  expect(ref.current?.getCrop()).toMatchObject({
    height: 300,
    originX: 150,
    originY: 250,
    rotation: 90,
    width: 300,
  });
});
it("ignores measurement callbacks when a quick gesture has ended or the canvas unmounts", async () => {
  setElementMeasurement("crop-surface", {
    height: 300,
    left: 0,
    top: 0,
    width: 300,
  });
  const ref = createRef<AvatarCropperHandle>();
  const view = render(model(ref));
  await settle();
  const tasks: (() => void)[] = [];
  const schedule = vi
    .spyOn(taroApi, "nextTick")
    .mockImplementation((listener) => {
      tasks.push(listener);
    });
  try {
    const surface = screen.getByLabelText("Photo crop");
    const before = ref.current?.getCrop();
    fireEvent.touchStart(surface, {
      touches: [p(1, 100, 150), p(2, 200, 150)],
    });
    fireEvent.touchMove(surface, { touches: [p(1, 50, 150), p(2, 250, 150)] });
    fireEvent.touchEnd(surface, { touches: [] });
    await act(async () => {
      for (const run of tasks.splice(0)) {
        run();
      }
      await Promise.resolve();
    });
    expect(ref.current?.getCrop()).toEqual(before);
    fireEvent.touchStart(surface, {
      touches: [p(1, 100, 150), p(2, 200, 150)],
    });
    fireEvent.touchMove(surface, { touches: [p(1, 50, 150), p(2, 250, 150)] });
    view.unmount();
    await act(async () => {
      for (const run of tasks.splice(0)) {
        run();
      }
      await Promise.resolve();
    });
    expect(ref.current).toBeNull();
  } finally {
    schedule.mockRestore();
  }
});
