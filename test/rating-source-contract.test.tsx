// @vitest-environment happy-dom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Rating } from "../src/components/Rating";
import {
  normalizeRatingMax,
  normalizeRatingPrecision,
  ratingFromPosition,
} from "../src/components/Rating/inputs";
import { readTaroStyle } from "./taro-style";

const touch = (clientX: number) => ({ clientX, clientY: 10, identifier: 1 });
it("source input normalization and upward touch precision stay finite", () => {
  expect(normalizeRatingMax(Number.NaN)).toBe(5);
  expect(normalizeRatingPrecision(0)).toBe(1);
  expect(ratingFromPosition(18, 40, 5, 0.5)).toBe(2.5);
  expect(ratingFromPosition(200, 40, 5, 0.5)).toBe(5);
  expect(normalizeRatingMax(1e20)).toBeLessThanOrEqual(100);
});
it("fractional read-only ratings clip the exact glyph rather than rounding the visible score", () => {
  const { container } = render(
    <PanelUIProvider>
      <Rating readOnly value={2.5} size="md" />
    </PanelUIProvider>
  );
  expect(screen.getByRole("img").getAttribute("aria-valuenow")).toBe("2.5");
  const clips = container.querySelectorAll(".overflow-hidden");
  expect(readTaroStyle(clips[2])).toContain('"width":"24rpx"');
});
it("a half-step tap commits once and a second tap can clear it", async () => {
  const change = vi.fn();
  const commit = vi.fn();
  render(
    <PanelUIProvider>
      <Rating
        precision={0.5}
        allowClear
        onValueChange={change}
        onValueCommit={commit}
      />
    </PanelUIProvider>
  );
  const slider = screen.getByRole("slider");
  fireEvent.touchStart(slider, { touches: [touch(22)] });
  fireEvent.touchEnd(slider, { changedTouches: [touch(22)] });
  await waitFor(() => expect(commit).toHaveBeenCalledWith(2.5));
  expect(commit).toHaveBeenCalledTimes(1);
  fireEvent.touchStart(slider, { touches: [touch(22)] });
  fireEvent.touchEnd(slider, { changedTouches: [touch(22)] });
  await waitFor(() => expect(commit).toHaveBeenLastCalledWith(0));
  expect(slider.getAttribute("aria-valuenow")).toBe("0");
});
it("final touch coordinates determine a drag commit rather than the preceding move", async () => {
  const commit = vi.fn();
  render(
    <PanelUIProvider>
      <Rating precision={0.5} onValueCommit={commit} />
    </PanelUIProvider>
  );
  const slider = screen.getByRole("slider");
  fireEvent.touchStart(slider, { touches: [touch(12)] });
  await waitFor(() => expect(slider.getAttribute("aria-valuenow")).toBe("1"));
  fireEvent.touchMove(slider, { touches: [touch(20)] });
  fireEvent.touchEnd(slider, { changedTouches: [touch(32)] });
  await waitFor(() => expect(commit).toHaveBeenCalledWith(3.5));
});
it("read-only, disabled and cancelled touches never commit", async () => {
  const commit = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <Rating disabled onValueCommit={commit} />
    </PanelUIProvider>
  );
  fireEvent.touchStart(screen.getByRole("img"), { touches: [touch(22)] });
  fireEvent.touchEnd(screen.getByRole("img"));
  tree.rerender(
    <PanelUIProvider>
      <Rating onValueCommit={commit} />
    </PanelUIProvider>
  );
  const slider = screen.getByRole("slider");
  fireEvent.touchStart(slider, { touches: [touch(22)] });
  fireEvent.touchCancel(slider);
  fireEvent.touchEnd(slider);
  await waitFor(() => expect(slider.getAttribute("aria-valuenow")).toBe("0"));
  expect(commit).not.toHaveBeenCalled();
});
it("controlled refusal restores the visible fill after committing the requested value", async () => {
  const commit = vi.fn();
  const { container } = render(
    <PanelUIProvider>
      <Rating value={2} precision={0.5} onValueCommit={commit} />
    </PanelUIProvider>
  );
  const slider = screen.getByRole("slider");
  fireEvent.touchStart(slider, { touches: [touch(40)] });
  fireEvent.touchEnd(slider, { changedTouches: [touch(40)] });
  await waitFor(() => expect(commit).toHaveBeenCalledWith(4.5));
  await waitFor(() =>
    expect(
      readTaroStyle(container.querySelectorAll(".overflow-hidden")[2])
    ).toContain('"width":"0rpx"')
  );
  expect(slider.getAttribute("aria-valuenow")).toBe("2");
});
it("dragging back to the starting value does not turn allowClear into a drag-to-zero action", async () => {
  const commit = vi.fn();
  render(
    <PanelUIProvider>
      <Rating
        defaultValue={2.5}
        precision={0.5}
        allowClear
        onValueCommit={commit}
      />
    </PanelUIProvider>
  );
  const slider = screen.getByRole("slider");
  fireEvent.touchStart(slider, { touches: [touch(22)] });
  fireEvent.touchMove(slider, { touches: [touch(28)] });
  fireEvent.touchEnd(slider, { changedTouches: [touch(22)] });
  await waitFor(() => expect(commit).toHaveBeenCalledWith(2.5));
});
it("extremely small positive precision cannot turn a positive touch or the full endpoint into zero", () => {
  expect(ratingFromPosition(40, 40, 5, Number.MIN_VALUE)).toBe(5);
  expect(ratingFromPosition(20, 40, 5, Number.MIN_VALUE)).toBe(2.5);
});
