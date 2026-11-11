// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { Direction } from "../src/components/Direction";
import { PanelUIProvider } from "../src/components/Provider";
import { Splitter } from "../src/components/Splitter";
import {
  isCollapsed,
  layoutOffset,
  normalizeConstraint,
  panelFloor,
  resetLayout,
  resizeLayout,
  resolveLayout,
} from "../src/components/Splitter/splitter-math";
import { deferred } from "./helpers/deferred";
import { setElementMeasurement, showActionSheet } from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const touches = (x: number, y = 0) => [
  { clientX: x, clientY: y, identifier: 1 },
];
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const measure = () =>
  setElementMeasurement("split-test", {
    height: 100,
    left: 0,
    top: 0,
    width: 200,
  });
const panelStyle = () => readTaroStyle(screen.getByTestId("first"));
it("source math resolves shares, respects constraints, collapses only shrinking panes and resets the pair", () => {
  const defaults: {
    constraint?: Parameters<typeof normalizeConstraint>[0];
  } = {};
  const ordinary = normalizeConstraint(defaults.constraint);
  const collapsed = normalizeConstraint({ collapsible: true, minSize: 20 });
  expect(panelFloor(collapsed)).toBe(0);
  expect(
    resolveLayout([30, undefined, undefined], [ordinary, ordinary, ordinary])
  ).toEqual([30, 35, 35]);
  expect(resizeLayout([50, 50], 0, -45, [collapsed, ordinary])).toEqual([
    0, 100,
  ]);
  expect(resizeLayout([50, 50], 0, -35, [collapsed, ordinary])).toEqual([
    20, 80,
  ]);
  expect(
    resizeLayout([50, 30, 20], 0, 10, [ordinary, ordinary, ordinary])
  ).toEqual([60, 20, 20]);
  expect(
    resetLayout([70, 20, 10], [60, 30, 10], 0, [ordinary, ordinary, ordinary])
  ).toEqual([60, 30, 10]);
  expect(layoutOffset([50, 30, 20], 1)).toBe(80);
  expect(isCollapsed(0, collapsed)).toBe(true);
  expect(resizeLayout([50, 50], -1, 20, [ordinary, ordinary])).toEqual([
    50, 50,
  ]);
  expect(resizeLayout([50, 50], 0, Number.NaN, [ordinary, ordinary])).toEqual([
    50, 50,
  ]);
  expect(
    resolveLayout(
      [undefined, undefined],
      [
        normalizeConstraint({ minSize: 80 }),
        normalizeConstraint({ minSize: 80 }),
      ]
    )
  ).toEqual([50, 50]);
});
it("measured drag updates panes without reporting each frame then commits once", async () => {
  measure();
  const changed = vi.fn();
  render(
    <PanelUIProvider>
      <Splitter
        id="split-test"
        defaultLayout={[50, 50]}
        onLayoutChange={changed}
      >
        <Splitter.Panel data-testid="first">A</Splitter.Panel>
        <Splitter.Handle />
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </PanelUIProvider>
  );
  await settle();
  const handle = screen.getByRole("separator");
  expect(panelStyle()).toContain('"width":"200rpx"');
  fireEvent.touchStart(handle, { touches: touches(100) });
  fireEvent.touchMove(handle, { touches: touches(140) });
  expect(panelStyle()).toContain('"width":"280rpx"');
  expect(changed).not.toHaveBeenCalled();
  fireEvent.touchEnd(handle, { changedTouches: touches(140) });
  await settle();
  expect(changed).toHaveBeenCalledExactlyOnceWith([70, 30]);
  expect(handle.getAttribute("aria-valuenow")).toBe("70");
});
it("controlled owners can refuse a drag and early perpendicular motion never claims the seam", async () => {
  measure();
  const changed = vi.fn();
  render(
    <PanelUIProvider>
      <Splitter id="split-test" layout={[50, 50]} onLayoutChange={changed}>
        <Splitter.Panel data-testid="first">A</Splitter.Panel>
        <Splitter.Handle />
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </PanelUIProvider>
  );
  await settle();
  const handle = screen.getByRole("separator");
  fireEvent.touchStart(handle, { touches: touches(100) });
  fireEvent.touchMove(handle, { touches: touches(140) });
  fireEvent.touchEnd(handle, { changedTouches: touches(140) });
  await settle();
  expect(changed).toHaveBeenLastCalledWith([70, 30]);
  expect(panelStyle()).toContain('"width":"200rpx"');
  changed.mockClear();
  fireEvent.touchStart(handle, { touches: touches(100, 0) });
  fireEvent.touchMove(handle, { touches: touches(102, 20) });
  fireEvent.touchEnd(handle, { changedTouches: touches(102, 20) });
  await settle();
  expect(changed).not.toHaveBeenCalled();
});
it("RTL changes horizontal drag sign while double tap restores the original pair", async () => {
  measure();
  const changed = vi.fn();
  render(
    <PanelUIProvider>
      <Direction dir="rtl">
        <Splitter
          id="split-test"
          defaultLayout={[50, 50]}
          onLayoutChange={changed}
        >
          <Splitter.Panel data-testid="first">A</Splitter.Panel>
          <Splitter.Handle />
          <Splitter.Panel>B</Splitter.Panel>
        </Splitter>
      </Direction>
    </PanelUIProvider>
  );
  await settle();
  const handle = screen.getByRole("separator");
  fireEvent.touchStart(handle, { touches: touches(100) });
  fireEvent.touchMove(handle, { touches: touches(60) });
  fireEvent.touchEnd(handle, { changedTouches: touches(60) });
  await settle();
  expect(changed).toHaveBeenLastCalledWith([70, 30]);
  fireEvent.click(handle);
  fireEvent.click(handle);
  fireEvent.click(handle);
  await settle();
  expect(changed).toHaveBeenLastCalledWith([50, 50]);
  expect(panelStyle()).toContain('"width":"200rpx"');
});
it("native action menu steps only the target pair and discards disabled or unmounted replies", async () => {
  measure();
  const changed = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <Splitter
        id="split-test"
        defaultLayout={[50, 50]}
        onLayoutChange={changed}
      >
        <Splitter.Panel data-testid="first">A</Splitter.Panel>
        <Splitter.Handle />
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </PanelUIProvider>
  );
  await settle();
  const handle = screen.getByRole("separator");
  dispatchTaroEvent(handle, TARO_TEST_EVENTS.longPress, {});
  await settle();
  expect(changed).toHaveBeenCalledExactlyOnceWith([55, 45]);
  const pending = deferred<{
    tapIndex: number;
  }>();
  showActionSheet.mockImplementationOnce(() => pending.promise);
  dispatchTaroEvent(handle, TARO_TEST_EVENTS.longPress, {});
  tree.unmount();
  await act(async () => {
    pending.resolve({ tapIndex: 1 });
    await Promise.resolve();
  });
  expect(changed).toHaveBeenCalledTimes(1);
});
it("configuration changes and foreign touches cancel without committing stale drag geometry", async () => {
  measure();
  const changed = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <Splitter
        id="split-test"
        defaultLayout={[50, 50]}
        onLayoutChange={changed}
      >
        <Splitter.Panel data-testid="first">A</Splitter.Panel>
        <Splitter.Handle />
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </PanelUIProvider>
  );
  await settle();
  const handle = screen.getByRole("separator");
  fireEvent.touchStart(handle, { touches: touches(100) });
  fireEvent.touchMove(handle, { touches: touches(140) });
  tree.rerender(
    <PanelUIProvider>
      <Splitter
        id="split-test"
        orientation="vertical"
        defaultLayout={[50, 50]}
        onLayoutChange={changed}
      >
        <Splitter.Panel data-testid="first">A</Splitter.Panel>
        <Splitter.Handle />
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </PanelUIProvider>
  );
  await settle();
  fireEvent.touchEnd(handle, { changedTouches: touches(140) });
  await settle();
  expect(changed).not.toHaveBeenCalled();
  expect(panelStyle()).toContain('"height":"100rpx"');
  fireEvent.touchStart(handle, { touches: touches(0, 20) });
  fireEvent.touchMove(handle, {
    touches: [{ clientX: 0, clientY: 60, identifier: 2 }],
  });
  fireEvent.touchEnd(handle, { changedTouches: touches(0, 60) });
  await settle();
  expect(changed).not.toHaveBeenCalled();
});
it("computed pane geometry wins over caller styles and frozen seams remain inert", async () => {
  measure();
  const changed = vi.fn();
  render(
    <PanelUIProvider>
      <Splitter
        id="split-test"
        disabled
        defaultLayout={[50, 50]}
        onLayoutChange={changed}
      >
        <Splitter.Panel
          data-testid="first"
          style="width:999rpx;background-color:red"
        >
          A
        </Splitter.Panel>
        <Splitter.Handle withGrip={false} />
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </PanelUIProvider>
  );
  await settle();
  expect(panelStyle()).toContain(
    "width:999rpx;background-color:red;width:200rpx"
  );
  const handle = screen.getByRole("separator");
  fireEvent.touchStart(handle, { touches: touches(100) });
  fireEvent.touchMove(handle, { touches: touches(140) });
  fireEvent.touchEnd(handle, { changedTouches: touches(140) });
  dispatchTaroEvent(handle, TARO_TEST_EVENTS.longPress, {});
  await settle();
  expect(changed).not.toHaveBeenCalled();
  expect(handle.getAttribute("aria-disabled")).toBe("true");
  expect(handle.children).toHaveLength(1);
});
it("cancelling an untouched seam cannot roll back another seam's active drag", async () => {
  measure();
  render(
    <PanelUIProvider>
      <Splitter id="split-test" defaultLayout={[50, 30, 20]}>
        <Splitter.Panel data-testid="first">A</Splitter.Panel>
        <Splitter.Handle data-testid="first-handle" />
        <Splitter.Panel>B</Splitter.Panel>
        <Splitter.Handle data-testid="other-handle" />
        <Splitter.Panel>C</Splitter.Panel>
      </Splitter>
    </PanelUIProvider>
  );
  await settle();
  const active = screen.getByTestId("first-handle");
  fireEvent.touchStart(active, { touches: touches(100) });
  fireEvent.touchMove(active, { touches: touches(120) });
  expect(panelStyle()).toContain('"width":"240rpx"');
  fireEvent.touchCancel(screen.getByTestId("other-handle"));
  expect(panelStyle()).toContain('"width":"240rpx"');
});
const AcceptingSplitter = () => {
  const [layout, setLayout] = useState([50, 50]);
  return (
    <PanelUIProvider>
      <Splitter id="split-test" layout={layout} onLayoutChange={setLayout}>
        <Splitter.Panel data-testid="first">A</Splitter.Panel>
        <Splitter.Handle />
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </PanelUIProvider>
  );
};
it("controlled accepted drags still reset to the proportions before any drag", async () => {
  measure();
  render(<AcceptingSplitter />);
  await settle();
  const handle = screen.getByRole("separator");
  fireEvent.touchStart(handle, { touches: touches(100) });
  fireEvent.touchMove(handle, { touches: touches(140) });
  fireEvent.touchEnd(handle, { changedTouches: touches(140) });
  await settle();
  expect(panelStyle()).toContain('"width":"280rpx"');
  fireEvent.click(handle);
  fireEvent.click(handle);
  fireEvent.click(handle);
  await settle();
  expect(panelStyle()).toContain('"width":"200rpx"');
});
it("switching reading direction during a horizontal drag cancels its old coordinate basis", async () => {
  measure();
  const changed = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <Direction dir="ltr">
        <Splitter
          id="split-test"
          defaultLayout={[50, 50]}
          onLayoutChange={changed}
        >
          <Splitter.Panel data-testid="first">A</Splitter.Panel>
          <Splitter.Handle />
          <Splitter.Panel>B</Splitter.Panel>
        </Splitter>
      </Direction>
    </PanelUIProvider>
  );
  await settle();
  const handle = screen.getByRole("separator");
  fireEvent.touchStart(handle, { touches: touches(100) });
  fireEvent.touchMove(handle, { touches: touches(140) });
  tree.rerender(
    <PanelUIProvider>
      <Direction dir="rtl">
        <Splitter
          id="split-test"
          defaultLayout={[50, 50]}
          onLayoutChange={changed}
        >
          <Splitter.Panel data-testid="first">A</Splitter.Panel>
          <Splitter.Handle />
          <Splitter.Panel>B</Splitter.Panel>
        </Splitter>
      </Direction>
    </PanelUIProvider>
  );
  await settle();
  fireEvent.touchMove(handle, { touches: touches(120) });
  fireEvent.touchEnd(handle, { changedTouches: touches(120) });
  await settle();
  expect(changed).not.toHaveBeenCalled();
  expect(panelStyle()).toContain('"width":"200rpx"');
});
it("release commits the last displayed layout instead of redrawing from the end coordinate", async () => {
  measure();
  const changed = vi.fn();
  render(
    <PanelUIProvider>
      <Splitter
        id="split-test"
        defaultLayout={[50, 50]}
        onLayoutChange={changed}
      >
        <Splitter.Panel data-testid="first">A</Splitter.Panel>
        <Splitter.Handle />
        <Splitter.Panel>B</Splitter.Panel>
      </Splitter>
    </PanelUIProvider>
  );
  await settle();
  const handle = screen.getByRole("separator");
  fireEvent.touchStart(handle, { touches: touches(100) });
  fireEvent.touchMove(handle, { touches: touches(140) });
  fireEvent.touchEnd(handle, { changedTouches: touches(150) });
  await settle();
  expect(changed).toHaveBeenCalledExactlyOnceWith([70, 30]);
});
