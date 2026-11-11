// @vitest-environment happy-dom

import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Sortable } from "../src/components/Sortable";
import { targetIndex } from "../src/components/Sortable/geometry";
import { moveWithPinned } from "../src/components/Sortable/reorder";
import FIXTURES from "./fixtures/sortable-source.json";
import { setTestMeasurement, showActionSheet } from "./taro-api";

it.each(FIXTURES.moves)(
  "matches pinned source reorder $from/$to/$id/$pinned",
  ({ from, to, id, pinned, output }) => {
    expect(
      moveWithPinned(
        FIXTURES.order,
        FIXTURES.order,
        pinned as Readonly<Record<string, boolean>>,
        id,
        from,
        to
      )
    ).toEqual(output);
  }
);
it.each(FIXTURES.targets)(
  "matches pinned source uneven-height target $current/$top",
  ({ current, height, top, output }) => {
    expect(
      targetIndex(FIXTURES.order, current, top, height, FIXTURES.heights, 8)
    ).toBe(output);
  }
);
const point = (y: number, identifier = 1) => ({
  clientX: 20,
  clientY: y,
  identifier,
});
const flush = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const Fixture = ({
  onReorder,
  longPress = false,
}: {
  onReorder: (ids: string[]) => void;
  longPress?: boolean;
}) => {
  const [order, setOrder] = useState(["a", "b", "c", "d"]);
  return (
    <Sortable
      value={order}
      gap={8}
      activation={longPress ? "longPress" : "handle"}
      onReorder={(next) => {
        setOrder(next);
        onReorder(next);
      }}
    >
      {order.map((id) => (
        <Sortable.Item
          key={id}
          id={id}
          pinned={id === "b"}
          className={`sortable-${id}`}
        >
          <Sortable.Handle accessibilityLabel={`Move ${id}`} />
          {id}
        </Sortable.Item>
      ))}
    </Sortable>
  );
};
it("native handle drag crosses pinned rows, commits on landing and keeps pins at source slots", async () => {
  setTestMeasurement(300, 375);
  const reorder = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Fixture onReorder={reorder} />
    </PanelUIProvider>
  );
  await flush();
  const handle = screen.getByLabelText("Move a");
  fireEvent.touchStart(handle, { touches: [point(10)] });
  fireEvent.touchMove(handle, { touches: [point(25)] });
  fireEvent.touchMove(handle, { touches: [point(100)] });
  expect(reorder).not.toHaveBeenCalled();
  fireEvent.touchEnd(handle, { changedTouches: [point(100)] });
  expect(reorder).toHaveBeenLastCalledWith(["c", "b", "d", "a"]);
});
it("maps native accessibility to pinned-aware source stepping and cannot move pinned handles", async () => {
  const reorder = vi.fn();
  showActionSheet.mockResolvedValueOnce({ tapIndex: 1 });
  render(
    <PanelUIProvider reducedMotion>
      <Fixture onReorder={reorder} />
    </PanelUIProvider>
  );
  await flush();
  fireEvent.click(screen.getByLabelText("Move a"));
  await flush();
  expect(reorder).toHaveBeenLastCalledWith(["c", "b", "a", "d"]);
  fireEvent.click(screen.getByLabelText("Move b"));
  await flush();
  expect(reorder).toHaveBeenCalledOnce();
});
it("long press waits source220ms before starting and cancelled multi-touch finalizes once", async () => {
  vi.useFakeTimers();
  const reorder = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Fixture onReorder={reorder} longPress />
    </PanelUIProvider>
  );
  await flush();
  const row = document.querySelector(".sortable-a");
  if (!row) {
    throw new Error("Missing row");
  }
  fireEvent.touchStart(row, { touches: [point(10)] });
  act(() => vi.advanceTimersByTime(219));
  expect(row.className).not.toContain("shadow-lg");
  act(() => vi.advanceTimersByTime(1));
  expect(row.className).toContain("shadow-lg");
  fireEvent.touchMove(row, { touches: [point(100)] });
  fireEvent.touchMove(row, { touches: [point(100), point(110, 2)] });
  expect(reorder).toHaveBeenCalledOnce();
  fireEvent.touchEnd(row, { changedTouches: [point(100)] });
  expect(reorder).toHaveBeenCalledOnce();
  vi.useRealTimers();
});
it("uses native-pixel scroll adapter metrics once and stops autoscroll after landing", async () => {
  vi.useFakeTimers();
  setTestMeasurement(600, 750);
  let offset = 0;
  const scroll = vi.fn((next: number) => {
    offset = next;
  });
  const ref = {
    current: {
      readNativeMetrics: () => ({ height: 200, offset, pageY: 0 }),
      scrollToNative: scroll,
    },
  };
  const view = render(
    <PanelUIProvider reducedMotion>
      <Sortable value={["a", "c"]} scrollRef={ref}>
        <Sortable.Item id="a">
          <Sortable.Handle accessibilityLabel="Auto handle" />a
        </Sortable.Item>
        <Sortable.Item id="c">c</Sortable.Item>
      </Sortable>
    </PanelUIProvider>
  );
  await flush();
  const handle = screen.getByLabelText("Auto handle");
  fireEvent.touchStart(handle, { touches: [point(10)] });
  fireEvent.touchMove(handle, { touches: [point(180)] });
  act(() => vi.advanceTimersByTime(16));
  expect(scroll.mock.calls[0][0]).toBeCloseTo((((90 - 28) / 72) * 8) / 0.5, 10);
  fireEvent.touchEnd(handle, { changedTouches: [point(180)] });
  const count = scroll.mock.calls.length;
  act(() => vi.advanceTimersByTime(100));
  expect(scroll).toHaveBeenCalledTimes(count);
  view.unmount();
  vi.useRealTimers();
});
