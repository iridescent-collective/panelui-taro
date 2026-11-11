// @vitest-environment happy-dom
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { Camera } from "../src/components/Camera";
import type { CameraHandle } from "../src/components/Camera";
import { PanelUIProvider } from "../src/components/Provider";
import {
  cameraContext,
  authorize,
  getSetting,
  setElementMeasurement,
  emitTestResize,
} from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";
const setup = async (props: object = {}) => {
  const ref = createRef<CameraHandle>();
  const capture = vi.fn();
  const error = vi.fn();
  const tree = render(
    <PanelUIProvider reducedMotion>
      <Camera ref={ref} onCapture={capture} onError={error} {...props}>
        <Camera.Preview />
        <Camera.Header>
          <Camera.Flash />
          <Camera.Timer />
        </Camera.Header>
        <Camera.Footer>
          <Camera.Modes />
          <Camera.Controls>
            <Camera.Library />
            <Camera.Shutter />
            <Camera.Flip />
          </Camera.Controls>
        </Camera.Footer>
      </Camera>
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const preview = tree.container.querySelector("section");
  if (preview)
    act(() =>
      dispatchTaroEvent(preview, TARO_TEST_EVENTS.cameraInit, { maxZoom: 5 })
    );
  return { ...tree, ref, capture, error };
};
it("takes a photo with real adapter dimensions and resets busy state", async () => {
  const { ref, capture, error } = await setup();
  await act(async () => {
    await ref.current?.takePhoto();
  });
  expect(cameraContext.takePhoto).toHaveBeenCalledTimes(1);
  expect(capture).toHaveBeenCalledWith(
    expect.objectContaining({
      type: "photo",
      uri: "/tmp/photo.jpg",
      width: expect.any(Number),
      height: expect.any(Number),
    })
  );
  expect(error).not.toHaveBeenCalled();
});
it("cycles photo/video flash, disables video timer, flips and resets zoom", async () => {
  await setup();
  fireEvent.click(screen.getByRole("button", { name: "Flash: Off" }));
  expect(screen.getByRole("button", { name: "Flash: Auto" })).toBeTruthy();
  fireEvent.click(screen.getByRole("tab", { name: "Video" }));
  expect(screen.getByRole("button", { name: "Flash: Off" })).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Timer: Off" })
      .getAttribute("aria-disabled")
  ).toBe("true");
  fireEvent.click(
    screen.getByRole("button", { name: "Switch camera: Back camera" })
  );
  expect(
    screen.getByRole("button", { name: "Switch camera: Front camera" })
  ).toBeTruthy();
});
it("hands video to the caller once and resolves startRecording after stop", async () => {
  const { ref, capture } = await setup({
    defaultMode: "video",
    maxDuration: 2,
  });
  let done: Promise<void> | undefined;
  await act(async () => {
    done = ref.current?.startRecording();
    await Promise.resolve();
  });
  expect(authorize).toHaveBeenCalledWith({ scope: "scope.record" });
  expect(screen.getByRole("button", { name: "Stop recording" })).toBeTruthy();
  await act(async () => {
    ref.current?.stopRecording();
    await done;
  });
  expect(capture).toHaveBeenCalledTimes(1);
  expect(capture).toHaveBeenCalledWith(
    expect.objectContaining({ type: "video", uri: "/tmp/video.mp4" })
  );
});
it("rejects unsupported recording options explicitly without recording", async () => {
  const { ref, error } = await setup({ mute: true });
  await act(async () => {
    await ref.current?.startRecording();
  });
  expect(cameraContext.startRecord).not.toHaveBeenCalled();
  expect(error).toHaveBeenCalledWith(
    expect.objectContaining({ message: expect.stringContaining("unavailable") })
  );
});
it("permission refusal leaves a settings action and disables capture", async () => {
  getSetting.mockResolvedValueOnce({
    authSetting: { "scope.camera": false, "scope.record": false },
  });
  const { ref, capture } = await setup();
  expect(screen.getByRole("button", { name: "Open Settings" })).toBeTruthy();
  await act(async () => {
    await ref.current?.takePhoto();
  });
  expect(capture).not.toHaveBeenCalled();
});
it("cancels recording while microphone permission is pending", async () => {
  const { ref, capture } = await setup();
  let allow: ((value: { errMsg: string }) => void) | undefined;
  authorize.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        allow = resolve;
      })
  );
  let done: Promise<void> | undefined;
  act(() => {
    done = ref.current?.startRecording();
  });
  act(() => ref.current?.stopRecording());
  await act(async () => {
    allow?.({ errMsg: "ok" });
    await done;
  });
  expect(cameraContext.startRecord).not.toHaveBeenCalled();
  expect(capture).not.toHaveBeenCalled();
});
it("stops a late native recording start without delivering a cancelled clip", async () => {
  const { ref, capture } = await setup();
  let started: ((value: { errMsg: string }) => void) | undefined;
  cameraContext.startRecord.mockImplementationOnce((options) => {
    started = options.success;
  });
  let done: Promise<void> | undefined;
  await act(async () => {
    done = ref.current?.startRecording();
    await Promise.resolve();
  });
  act(() => ref.current?.stopRecording());
  await act(async () => {
    started?.({ errMsg: "ok" });
    await done;
  });
  expect(cameraContext.stopRecord).toHaveBeenCalledTimes(1);
  expect(capture).not.toHaveBeenCalled();
});
it("keeps a controlled camera ready when its parent declines a flip", async () => {
  await setup({ facing: "back", onFacingChange: vi.fn() });
  fireEvent.click(
    screen.getByRole("button", { name: "Switch camera: Back camera" })
  );
  expect(
    screen
      .getByRole("button", { name: "Take photo" })
      .getAttribute("aria-disabled")
  ).toBe("false");
});

it("settles a recording even when the capture consumer throws", async () => {
  const { ref, error } = await setup({
    onCapture: () => {
      throw new Error("consumer failed");
    },
  });
  let done: Promise<void> | undefined;
  await act(async () => {
    done = ref.current?.startRecording();
    await Promise.resolve();
  });
  await act(async () => {
    ref.current?.stopRecording();
    await done;
  });
  expect(error).toHaveBeenCalledWith(
    expect.objectContaining({ message: "consumer failed" })
  );
});
it("never returns the previous file from a skipped raw recording", async () => {
  const { ref } = await setup();
  let recording: Promise<{ uri: string } | undefined> | undefined;
  await act(async () => {
    recording = ref.current?.view?.recordAsync();
    await Promise.resolve();
  });
  await act(async () => {
    ref.current?.stopRecording();
    expect(await recording).toEqual({ uri: "/tmp/video.mp4" });
  });
  await act(async () => {
    await ref.current?.view?.pausePreview();
  });
  await act(async () => {
    expect(await ref.current?.view?.recordAsync()).toBeUndefined();
  });
});
it("remounts the actual camera after an accepted flip and recovers on initialization", async () => {
  const { container } = await setup();
  const first = container.querySelector("section");
  fireEvent.click(
    screen.getByRole("button", { name: "Switch camera: Back camera" })
  );
  const second = container.querySelector("section");
  expect(second).not.toBe(first);
  expect(
    screen
      .getByRole("button", { name: "Take photo" })
      .getAttribute("aria-disabled")
  ).toBe("true");
  if (!second) throw new Error("Missing camera after flip");
  act(() =>
    dispatchTaroEvent(second, TARO_TEST_EVENTS.cameraInit, { maxZoom: 3 })
  );
  expect(
    screen
      .getByRole("button", { name: "Take photo" })
      .getAttribute("aria-disabled")
  ).toBe("false");
});
it("stacks permission text vertically in the space between camera chrome", async () => {
  getSetting.mockResolvedValueOnce({
    authSetting: { "scope.camera": false, "scope.record": false },
  });
  await setup();
  const notice = screen.getByText("Camera access").parentElement;
  expect(notice?.className).toContain("flex-col");
});

it("keeps the camera mode thumb aligned to localized labels and resized tabs", async () => {
  const renderModes = (labels: { video: string; photo: string }) => (
    <PanelUIProvider reducedMotion>
      <Camera>
        <Camera.Modes id="camera-modes" labels={labels} />
      </Camera>
    </PanelUIProvider>
  );
  const tree = render(renderModes({ video: "录像", photo: "拍摄照片" }));
  const track = screen.getByRole("tablist");
  const video = screen.getByRole("tab", { name: "录像" });
  const photo = screen.getByRole("tab", { name: "拍摄照片" });
  setElementMeasurement(track.id, {
    height: 40,
    left: 100,
    top: 8,
    width: 208,
  });
  setElementMeasurement(video.id, {
    height: 32,
    left: 104,
    top: 12,
    width: 80,
  });
  setElementMeasurement(photo.id, {
    height: 32,
    left: 184,
    top: 12,
    width: 120,
  });
  act(() => emitTestResize());
  const thumb = () =>
    readTaroStyle(track.querySelector('[aria-hidden="true"]'));
  await waitFor(() => expect(thumb()).toContain('"width":"240rpx"'));
  expect(thumb()).toContain("translateX(168rpx)");
  setElementMeasurement(video.id, {
    height: 32,
    left: 104,
    top: 12,
    width: 100,
  });
  setElementMeasurement(photo.id, {
    height: 32,
    left: 204,
    top: 12,
    width: 120,
  });
  tree.rerender(renderModes({ video: "录制视频", photo: "拍摄照片" }));
  await waitFor(() => expect(thumb()).toContain("translateX(208rpx)"));
  expect(photo.getAttribute("aria-selected")).toBe("true");
  fireEvent.click(video);
  await waitFor(() => expect(thumb()).toContain('"width":"200rpx"'));
  expect(thumb()).toContain("translateX(8rpx)");
  expect(video.getAttribute("aria-selected")).toBe("true");
  setElementMeasurement(video.id, {
    height: 32,
    left: 104,
    top: 12,
    width: 110,
  });
  act(() => emitTestResize());
  await waitFor(() => expect(thumb()).toContain('"width":"220rpx"'));
});

it("locks camera mode selection while recording with the selected thumb intact", async () => {
  const { ref } = await setup({ defaultMode: "video" });
  let done: Promise<void> | undefined;
  await act(async () => {
    done = ref.current?.startRecording();
    await Promise.resolve();
  });
  const photo = screen.getByRole("tab", { name: "Photo" });
  expect(photo.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(photo);
  expect(
    screen.getByRole("tab", { name: "Video" }).getAttribute("aria-selected")
  ).toBe("true");
  await act(async () => {
    ref.current?.stopRecording();
    await done;
  });
  fireEvent.click(photo);
  expect(photo.getAttribute("aria-selected")).toBe("true");
});
