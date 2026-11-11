// @vitest-environment happy-dom
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ImageViewer } from "../src/components/ImageViewer";
import {
  dragFade,
  dragScale,
  shouldDismiss,
  snapPage,
  fitWithin,
  coverSize,
  focalTranslation,
  hitsRect,
  panBound,
  rubberBandClamp,
} from "../src/components/ImageViewer/geometry";
import { ViewerStore } from "../src/components/ImageViewer/store";
import { PanelUIProvider } from "../src/components/Provider";
import FIXTURES from "./fixtures/image-viewer-source.json";
import {
  getSystemInfoSync,
  getWindowInfo,
  setTestMeasurement,
} from "./taro-api";
import { readTaroStyle } from "./taro-style";

const viewerGestureArea = () => {
  const dialog = document.querySelector('[data-weapp-role="dialog"]');
  if (!dialog) {
    throw new Error("Viewer dialog missing");
  }
  const [, overlay] = dialog.children;
  if (!overlay) {
    throw new Error("Viewer gesture area missing");
  }
  return overlay;
};

it.each(FIXTURES.frames)(
  "matches pinned source drag/page $input.offset/$input.velocity/$input.page",
  ({ input, output }) => {
    expect({
      dismiss: shouldDismiss(input.offset, input.velocity),
      fade: dragFade(input.offset, 812),
      scale: dragScale(input.offset, 812),
      snap: snapPage(input.offset, input.velocity, input.page, 4, 391),
    }).toEqual(output);
  }
);
it.each(FIXTURES.fits)(
  "matches pinned source fit/pinch $scale/$image.width/$image.height",
  ({ box, image, scale, output }) => {
    const fit = fitWithin(image, box);
    expect({
      boundX: panBound(fit.width, scale, 375),
      cover: coverSize(image, box),
      fit,
      focal: focalTranslation(75, 30, 1.5, scale),
      hit: hitsRect(150, 300, fit, scale, 0, 20),
      rubber: rubberBandClamp(scale, 1, 4, 4),
    }).toEqual(output);
  }
);
const SOURCE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='80'/%3E";
const thumbnails = [
  <ImageViewer.Trigger
    key="first"
    source={SOURCE}
    width={100}
    height={80}
    alt="First"
    caption="One"
    className="h-[160px] w-[200px]"
  />,
  <ImageViewer.Trigger
    key="second"
    source={SOURCE}
    width={100}
    height={80}
    alt="Second"
    caption="Two"
    className="h-[160px] w-[200px]"
    index={1}
  />,
];
const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const point = (x: number, y: number, identifier = 1) => ({
  clientX: x,
  clientY: y,
  identifier,
});
it("registers source order, respects explicit indices and removes stale images", () => {
  const store = new ViewerStore();
  const source = { measure: () => {}, radius: 0, size: null, source: SOURCE };
  store.set({ ...source, id: "second", order: 1 });
  store.set({ ...source, id: "first", order: 0 });
  expect(store.list().map((item) => item.id)).toEqual(["first", "second"]);
  store.set({ ...source, id: "second", index: -1, order: 1 });
  expect(store.list()[0].id).toBe("second");
  store.delete("second");
  expect(store.list()).toHaveLength(1);
});
it("opens from measured trigger, pages via native gesture and closes after reduced fade", async () => {
  vi.useFakeTimers();
  setTestMeasurement(100, 375);
  const index = vi.fn();
  const open = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <ImageViewer onIndexChange={index} onOpenChange={open}>
        {thumbnails}
      </ImageViewer>
    </PanelUIProvider>
  );
  await flush();
  fireEvent.click(screen.getByLabelText("First"));
  await flush();
  act(() => vi.advanceTimersByTime(400));
  expect(open).toHaveBeenLastCalledWith(true);
  expect(screen.getByText("1 of 2")).toBeTruthy();
  const overlay = viewerGestureArea();
  fireEvent.touchStart(overlay, { touches: [point(300, 300)] });
  act(() => vi.advanceTimersByTime(20));
  fireEvent.touchMove(overlay, { touches: [point(100, 300)] });
  fireEvent.touchEnd(overlay, { changedTouches: [point(100, 300)] });
  expect(index).toHaveBeenLastCalledWith(1);
  expect(screen.getByText("2 of 2")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await flush();
  act(() => vi.advanceTimersByTime(200));
  expect(open).toHaveBeenLastCalledWith(false);
  expect(document.querySelector('[data-weapp-role="dialog"]')).toBeNull();
  view.unmount();
  vi.useRealTimers();
});
it("native two-finger pinch zooms, clamps on release, and vertical drag dismisses", async () => {
  vi.useFakeTimers();
  const open = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <ImageViewer onOpenChange={open}>{thumbnails}</ImageViewer>
    </PanelUIProvider>
  );
  await flush();
  fireEvent.click(screen.getByLabelText("First"));
  await flush();
  act(() => vi.advanceTimersByTime(400));
  const overlay = viewerGestureArea();
  fireEvent.touchStart(overlay, {
    touches: [point(100, 300), point(200, 300, 2)],
  });
  fireEvent.touchMove(overlay, {
    touches: [point(50, 300), point(250, 300, 2)],
  });
  fireEvent.touchEnd(overlay, { changedTouches: [point(50, 300)] });
  act(() => vi.advanceTimersByTime(3000));
  expect(document.querySelector('[data-weapp-role="dialog"]')).toBeTruthy();
  fireEvent.touchStart(overlay, { touches: [point(150, 300)] });
  fireEvent.touchEnd(overlay, { changedTouches: [point(150, 300)] });
  act(() => vi.advanceTimersByTime(100));
  fireEvent.touchStart(overlay, { touches: [point(150, 300)] });
  fireEvent.touchEnd(overlay, { changedTouches: [point(150, 300)] });
  act(() => vi.advanceTimersByTime(3000));
  fireEvent.touchStart(overlay, { touches: [point(150, 300)] });
  act(() => vi.advanceTimersByTime(20));
  fireEvent.touchMove(overlay, { touches: [point(150, 480)] });
  fireEvent.touchEnd(overlay, { changedTouches: [point(150, 480)] });
  await flush();
  act(() => vi.advanceTimersByTime(250));
  expect(open).toHaveBeenLastCalledWith(false);
  view.unmount();
  vi.useRealTimers();
});
it("closing while holding a page gesture prevents a late release from paging", async () => {
  vi.useFakeTimers();
  const index = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <ImageViewer onIndexChange={index}>{thumbnails}</ImageViewer>
    </PanelUIProvider>
  );
  await flush();
  fireEvent.click(screen.getByLabelText("First"));
  await flush();
  act(() => vi.advanceTimersByTime(400));
  const overlay = viewerGestureArea();
  fireEvent.touchStart(overlay, { touches: [point(300, 300)] });
  act(() => vi.advanceTimersByTime(20));
  fireEvent.touchMove(overlay, { touches: [point(100, 300)] });
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await flush();
  fireEvent.touchEnd(overlay, { changedTouches: [point(100, 300)] });
  expect(index).not.toHaveBeenCalled();
  view.unmount();
  vi.useRealTimers();
});
it.each([false, true])(
  "waits through zero movement and pages on a fast final touch (move event: %s)",
  async (moveEvent) => {
    vi.useFakeTimers();
    const index = vi.fn();
    const open = vi.fn();
    const view = render(
      <PanelUIProvider reducedMotion>
        <ImageViewer onIndexChange={index} onOpenChange={open}>
          {thumbnails}
        </ImageViewer>
      </PanelUIProvider>
    );
    await flush();
    fireEvent.click(screen.getByLabelText("First"));
    await flush();
    act(() => vi.advanceTimersByTime(400));
    const overlay = viewerGestureArea();
    fireEvent.touchStart(overlay, { touches: [point(300, 300)] });
    fireEvent.touchMove(overlay, { touches: [point(300, 300)] });
    act(() => vi.advanceTimersByTime(20));
    if (moveEvent) {
      fireEvent.touchMove(overlay, { touches: [point(100, 300)] });
    }
    fireEvent.touchEnd(overlay, { changedTouches: [point(100, 300)] });
    expect(index).toHaveBeenLastCalledWith(1);
    expect(open).toHaveBeenCalledTimes(1);
    expect(screen.getByText("2 of 2")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(
      view.container.querySelector<HTMLElement>("[data-panelui-content]")?.style
        .pointerEvents
    ).toBe("auto");
    expect(
      screen.getByRole("button", { name: "Close" }).style.pointerEvents
    ).toBe("none");
    const exiting = document.querySelector('[data-weapp-role="dialog"]');
    expect(
      exiting?.closest<HTMLElement>(".panelui-background-transparent")?.style
        .pointerEvents
    ).toBe("none");
    await flush();
    act(() => vi.advanceTimersByTime(200));
    view.unmount();
    vi.useRealTimers();
  }
);
it("exposes the image opener as an actionable button on WeChat", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <ImageViewer>{thumbnails}</ImageViewer>
    </PanelUIProvider>
  );
  await flush();
  expect(screen.getByRole("button", { name: "First" })).toBeTruthy();
});

it("RTL swipes right to advance logical indices and closes normally", async () => {
  vi.useFakeTimers();
  setTestMeasurement(100, 375);
  const index = vi.fn();
  const open = vi.fn();
  const view = render(
    <PanelUIProvider reducedMotion>
      <ImageViewer dir="rtl" onIndexChange={index} onOpenChange={open}>
        {thumbnails}
      </ImageViewer>
    </PanelUIProvider>
  );
  await flush();
  fireEvent.click(screen.getByLabelText("First"));
  await flush();
  act(() => vi.advanceTimersByTime(400));
  expect(open).toHaveBeenLastCalledWith(true);
  expect(screen.getByText("1 of 2")).toBeTruthy();
  const overlay = viewerGestureArea();
  fireEvent.touchStart(overlay, { touches: [point(100, 300)] });
  act(() => vi.advanceTimersByTime(20));
  fireEvent.touchMove(overlay, { touches: [point(300, 300)] });
  fireEvent.touchEnd(overlay, { changedTouches: [point(300, 300)] });
  expect(index).toHaveBeenLastCalledWith(1);
  expect(screen.getByText("2 of 2")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Close" }));
  await flush();
  act(() => vi.advanceTimersByTime(200));
  expect(open).toHaveBeenLastCalledWith(false);
  expect(document.querySelector('[data-weapp-role="dialog"]')).toBeNull();
  view.unmount();
  vi.useRealTimers();
});

it.each(["pinch-start", "pinch-move", "replacement-touch"])(
  "settles an interrupted RTL page drag before %s at system font 26",
  async (interruption) => {
    vi.useFakeTimers();
    getSystemInfoSync.mockReturnValue({
      ...getWindowInfo(),
      fontSizeSetting: 26,
    });
    try {
      setTestMeasurement(100, 375);
      const view = render(
        <PanelUIProvider reducedMotion>
          <ImageViewer dir="rtl">{thumbnails}</ImageViewer>
        </PanelUIProvider>
      );
      await flush();
      fireEvent.click(screen.getByLabelText("Second"));
      await flush();
      act(() => vi.advanceTimersByTime(400));
      const overlay = viewerGestureArea();
      const pictures = overlay.firstElementChild;
      expect(readTaroStyle(pictures)).toContain("translateX(782rpx)");
      fireEvent.touchStart(overlay, { touches: [point(300, 300)] });
      act(() => vi.advanceTimersByTime(20));
      fireEvent.touchMove(overlay, { touches: [point(100, 300)] });
      expect(readTaroStyle(pictures)).toContain("translateX(382rpx)");
      if (interruption === "replacement-touch") {
        fireEvent.touchStart(overlay, { touches: [point(200, 300, 2)] });
        fireEvent.touchEnd(overlay, { changedTouches: [point(200, 300, 2)] });
      } else {
        const touches = [point(100, 300), point(200, 300, 2)];
        if (interruption === "pinch-start") {
          fireEvent.touchStart(overlay, { touches });
        } else {
          fireEvent.touchMove(overlay, { touches });
        }
        fireEvent.touchEnd(overlay, { changedTouches: touches });
      }
      act(() => vi.advanceTimersByTime(2000));
      expect(screen.getByText("2 of 2")).toBeTruthy();
      expect(readTaroStyle(pictures)).toContain("translateX(782rpx)");
      view.unmount();
    } finally {
      getSystemInfoSync.mockReturnValue({
        ...getWindowInfo(),
        fontSizeSetting: 16,
      });
      vi.useRealTimers();
    }
  }
);
