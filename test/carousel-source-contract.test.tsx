// @vitest-environment happy-dom

import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { Carousel, useCarouselState } from "../src/components/Carousel";
import type {
  CarouselHandle,
  CarouselProps,
  CarouselVariant,
  CarouselOrientation,
} from "../src/components/Carousel";
import {
  carouselCaptionOpacity,
  carouselDistance,
  carouselDragPosition,
  carouselMotion,
  carouselReleaseIndex,
  normalizeCarouselIndex,
} from "../src/components/Carousel/math";
import { PanelUIProvider } from "../src/components/Provider";
import sourceFrames from "./fixtures/carousel-source.json";
import { setElementMeasurement, setTestMeasurement } from "./taro-api";
import { readTaroStyle } from "./taro-style";

const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
const point = (x: number, y = 25) => [
  { clientX: x, clientY: y, identifier: 1 },
];
const root = () => {
  const found = document.querySelector<HTMLElement>("#carousel-root");
  if (!found) {
    throw new Error("Missing carousel root");
  }
  return found;
};
const state = () =>
  JSON.parse(screen.getByTestId("carousel-state").textContent ?? "null") as {
    index: number;
    count: number;
  };
const Probe = () => {
  const { index, count } = useCarouselState();
  return (
    <span data-testid="carousel-state">{JSON.stringify({ count, index })}</span>
  );
};
const model = (
  props: CarouselProps,
  count = 3,
  ref?: React.Ref<CarouselHandle>,
  reduced = true
) => (
  <PanelUIProvider reducedMotion={reduced}>
    <Carousel
      {...props}
      id="carousel-root"
      ref={ref}
      itemSize={props.itemSize ?? 200}
    >
      <Carousel.Content id="carousel-content" className="h-[400px]">
        {Array.from({ length: count }, (_, index) => (
          <Carousel.Item key={`slide-${index}`} id={`carousel-slide-${index}`}>
            <Carousel.Caption>Caption {index}</Carousel.Caption>
          </Carousel.Item>
        ))}
      </Carousel.Content>
      <Carousel.Controls id="carousel-controls" />
      <Probe />
    </Carousel>
  </PanelUIProvider>
);
it("index normalization, wrapped distances, rubber bounds and single-step release follow the source", () => {
  expect(normalizeCarouselIndex(-1, 3, true)).toBe(2);
  expect(normalizeCarouselIndex(8, 3, false)).toBe(2);
  expect(normalizeCarouselIndex(Number.NaN, 3, false)).toBe(0);
  expect(carouselDistance(0, 2, 3, true)).toBe(1);
  expect(carouselDragPosition(0, 400, 200, 3, false)).toBe(-0.4);
  expect(carouselDragPosition(2, -400, 200, 3, false)).toBe(2.4);
  expect(carouselReleaseIndex(1, -400, 0, 200)).toBe(2);
  expect(carouselReleaseIndex(1, -20, -600, 200)).toBe(2);
  expect(carouselReleaseIndex(1, -56, 500, 200)).toBe(1);
  expect(carouselCaptionOpacity(0.15)).toBeCloseTo(0.5);
  expect(carouselCaptionOpacity(0.4)).toBe(0);
});
it("all four layouts retain source transforms, scale, opacity and z-order", () => {
  expect(carouselMotion("default", "vertical", 1, 200, 0)).toEqual({
    transform: "translateX(0rpx) translateY(400rpx)",
  });
  expect(carouselMotion("coverflow", "horizontal", 1, 200, 0)).toMatchObject({
    opacity: 0.75,
    zIndex: 90,
  });
  expect(
    carouselMotion("coverflow", "horizontal", 1, 200, 0).transform
  ).toContain("rotateY(-38deg) scale(0.92)");
  expect(carouselMotion("stack", "horizontal", 2, 200, 0)).toMatchObject({
    opacity: 1,
    transform: "translateX(0rpx) translateY(56rpx) rotate(0deg) scale(0.88)",
    zIndex: 80,
  });
  expect(
    carouselMotion("interactive", "horizontal", 0, 200, 1).transform
  ).toContain("scale(1)");
  expect(
    carouselMotion("interactive", "horizontal", 1, 200, 1).transform
  ).toContain("translateY(48rpx) rotate(20deg) scale(0.63)");
});
it("imperative controls, interactive dots and arrows update accepted indices and end states", async () => {
  const ref = createRef<CarouselHandle>();
  const change = vi.fn();
  render(model({ onIndexChange: change }, 3, ref));
  await settle();
  expect(state()).toEqual({ count: 3, index: 0 });
  expect(
    screen
      .getByRole("button", { name: "Previous slide" })
      .getAttribute("aria-disabled")
  ).toBe("true");
  act(() => ref.current?.next());
  expect(state().index).toBe(1);
  fireEvent.click(screen.getByRole("tab", { name: "Slide 3 of 3" }));
  expect(state().index).toBe(2);
  expect(
    screen
      .getByRole("button", { name: "Next slide" })
      .getAttribute("aria-disabled")
  ).toBe("true");
  act(() => ref.current?.scrollTo(99));
  expect(state().index).toBe(2);
  act(() => ref.current?.previous());
  expect(state().index).toBe(1);
  expect(change.mock.calls.map(([value]) => value)).toEqual([1, 2, 1]);
});
it("controlled refusal retains the accepted position and count corrections are reported only once", async () => {
  const change = vi.fn();
  const ref = createRef<CarouselHandle>();
  const view = render(model({ index: 2, onIndexChange: change }, 3, ref));
  await settle();
  act(() => ref.current?.previous());
  expect(change).toHaveBeenCalledWith(1);
  expect(state().index).toBe(2);
  view.rerender(model({ index: 2, onIndexChange: change }, 1, ref));
  await settle();
  expect(state()).toEqual({ count: 1, index: 0 });
  expect(change).toHaveBeenCalledWith(0);
  const calls = change.mock.calls.length;
  view.rerender(model({ index: 2, onIndexChange: change }, 1, ref));
  await settle();
  expect(change).toHaveBeenCalledTimes(calls);
  expect(screen.queryByRole("tablist")).toBeNull();
});
it("multiple cumulative drag updates use one contact origin and commit at most one slide", async () => {
  const change = vi.fn();
  render(model({ onIndexChange: change }));
  await settle();
  fireEvent.touchStart(root(), { touches: point(180) });
  fireEvent.touchMove(root(), { touches: point(140) });
  fireEvent.touchMove(root(), { touches: point(100) });
  expect(readTaroStyle(document.querySelector("#carousel-slide-0"))).toContain(
    "translateX(-160rpx)"
  );
  fireEvent.touchEnd(root(), { changedTouches: point(100) });
  expect(state().index).toBe(1);
  expect(change).toHaveBeenCalledTimes(1);
});
it("cross-axis motion and touch cancellation restore the accepted slide without changing index", async () => {
  const change = vi.fn();
  render(model({ defaultIndex: 1, onIndexChange: change }));
  await settle();
  fireEvent.touchStart(root(), { touches: point(180) });
  fireEvent.touchMove(root(), { touches: point(175, 90) });
  fireEvent.touchEnd(root(), { changedTouches: point(175, 90) });
  expect(state().index).toBe(1);
  fireEvent.touchStart(root(), { touches: point(180) });
  fireEvent.touchMove(root(), { touches: point(80) });
  fireEvent.touchCancel(root());
  expect(state().index).toBe(1);
  expect(change).not.toHaveBeenCalled();
  expect(readTaroStyle(document.querySelector("#carousel-slide-1"))).toContain(
    "translateX(0rpx)"
  );
});
it("vertical runs drag vertically while stack always deals sideways and inactive cards remain inert", async () => {
  const view = render(model({ orientation: "vertical" }));
  await settle();
  fireEvent.touchStart(root(), { touches: point(40, 180) });
  fireEvent.touchMove(root(), { touches: point(40, 80) });
  fireEvent.touchEnd(root(), { changedTouches: point(40, 80) });
  expect(state().index).toBe(1);
  view.rerender(model({ orientation: "vertical", variant: "stack" }));
  await settle();
  fireEvent.touchStart(root(), { touches: point(180) });
  fireEvent.touchMove(root(), { touches: point(80) });
  fireEvent.touchEnd(root(), { changedTouches: point(80) });
  expect(state().index).toBe(2);
  expect(readTaroStyle(document.querySelector("#carousel-slide-0"))).toContain(
    '"pointerEvents":"none"'
  );
  expect(
    document.querySelector("#carousel-slide-0")?.getAttribute("aria-hidden")
  ).toBe("true");
});
it("autoplay requests one advance per accepted index and stops permanently on first contact", async () => {
  vi.useFakeTimers();
  try {
    const change = vi.fn();
    render(
      model({ autoplay: true, autoplayInterval: 400, onIndexChange: change })
    );
    await settle();
    act(() => vi.advanceTimersByTime(400));
    expect(state().index).toBe(1);
    fireEvent.touchStart(root(), { touches: point(180) });
    act(() => vi.advanceTimersByTime(1000));
    expect(state().index).toBe(1);
    fireEvent.touchEnd(root(), { changedTouches: point(180) });
    act(() => vi.advanceTimersByTime(1000));
    expect(state().index).toBe(1);
    expect(change).toHaveBeenCalledTimes(1);
  } finally {
    vi.useRealTimers();
  }
});
it("controlled autoplay refusal does not produce recurring requests and empty runs do not advance", async () => {
  vi.useFakeTimers();
  try {
    const change = vi.fn();
    const view = render(
      model({
        autoplay: true,
        autoplayInterval: 400,
        index: 0,
        onIndexChange: change,
      })
    );
    await settle();
    act(() => vi.advanceTimersByTime(1600));
    expect(change).toHaveBeenCalledTimes(1);
    view.rerender(
      model(
        {
          autoplay: true,
          autoplayInterval: 400,
          index: 0,
          onIndexChange: change,
        },
        0
      )
    );
    await settle();
    act(() => vi.advanceTimersByTime(1600));
    expect(change).toHaveBeenCalledTimes(1);
    expect(state().count).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("loop requests choose the nearest spring representation and finally wrap without rewinding", async () => {
  vi.useFakeTimers();
  try {
    const ref = createRef<CarouselHandle>();
    render(model({ defaultIndex: 2, loop: true }, 3, ref, false));
    await settle();
    act(() => ref.current?.next());
    expect(state().index).toBe(0);
    act(() => vi.advanceTimersByTime(100));
    const style = readTaroStyle(document.querySelector("#carousel-slide-0"));
    expect(style).not.toContain("translateX(-800rpx)");
    act(() => vi.advanceTimersByTime(5000));
    expect(
      readTaroStyle(document.querySelector("#carousel-slide-0"))
    ).toContain("translateX(0rpx)");
  } finally {
    vi.useRealTimers();
  }
});
it("scrollEnabled and geometry changes cancel active drags, and native coordinates convert to logical points", async () => {
  setTestMeasurement(40, 750);
  try {
    const view = render(model({}));
    await settle();
    fireEvent.touchStart(root(), { touches: point(360) });
    fireEvent.touchMove(root(), { touches: point(200) });
    expect(
      readTaroStyle(document.querySelector("#carousel-slide-0"))
    ).toContain("translateX(-160rpx)");
    view.rerender(model({ scrollEnabled: false }));
    await settle();
    fireEvent.touchEnd(root(), { changedTouches: point(200) });
    expect(state().index).toBe(0);
  } finally {
    setTestMeasurement(40, 375);
  }
});
it("the measured root supplies item size and caption opacity without adding caption scale", async () => {
  setElementMeasurement("carousel-root", {
    height: 240,
    left: 10,
    top: 20,
    width: 300,
  });
  const layout = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Carousel id="carousel-root" onLayout={layout}>
        <Carousel.Content>
          <Carousel.Item id="measured-slide">
            <Carousel.Caption id="measured-caption">Measured</Carousel.Caption>
          </Carousel.Item>
        </Carousel.Content>
      </Carousel>
    </PanelUIProvider>
  );
  await settle();
  expect(readTaroStyle(document.querySelector("#measured-slide"))).toContain(
    '"width":"600rpx"'
  );
  expect(readTaroStyle(document.querySelector("#measured-caption"))).toBe(
    '{"opacity":1}'
  );
  expect(layout).toHaveBeenCalledWith({
    nativeEvent: { layout: { height: 240, width: 300, x: 10, y: 20 } },
  });
});
it("noninteractive dots never request navigation", async () => {
  const change = vi.fn();
  render(
    <PanelUIProvider>
      <Carousel onIndexChange={change}>
        <Carousel.Content>
          <Carousel.Item>A</Carousel.Item>
          <Carousel.Item>B</Carousel.Item>
        </Carousel.Content>
        <Carousel.Dots id="readonly-dots" interactive={false} />
      </Carousel>
    </PanelUIProvider>
  );
  await settle();
  fireEvent.click(
    within(screen.getByRole("tablist")).getByRole("tab", {
      name: "Slide 2 of 2",
    })
  );
  expect(change).not.toHaveBeenCalled();
});

const TRANSFORM_PATTERN =
  /(?<property>[a-zA-Z]+)\((?<value>-?[\d.]+)(?<unit>rpx|deg)?\)/gu;
it.each(sourceFrames.cases)(
  "source frame $variant $orientation distance=$d engaged=$engaged",
  (frame) => {
    const actual = carouselMotion(
      frame.variant as CarouselVariant,
      frame.orientation as CarouselOrientation,
      frame.d,
      frame.itemSize,
      frame.engaged
    );
    const transforms = [
      ...String(actual.transform).matchAll(TRANSFORM_PATTERN),
    ].map((match) => ({
      property: match.groups?.property,
      value:
        Number(match.groups?.value) / (match.groups?.unit === "rpx" ? 2 : 1),
    }));
    expect(transforms).toHaveLength(frame.motion.transform.length);
    for (const [index, expected] of frame.motion.transform.entries()) {
      const [[property, raw]] = Object.entries(expected);
      expect(transforms[index].property).toBe(
        property === "rotate" ? "rotate" : property
      );
      expect(transforms[index].value).toBeCloseTo(
        typeof raw === "number"
          ? raw
          : Number(String(raw).replace(/deg$/u, "")),
        10
      );
    }
    expect(actual.opacity).toBe(frame.motion.opacity);
    expect(actual.zIndex).toBe(frame.motion.zIndex);
    expect(carouselCaptionOpacity(frame.d)).toBeCloseTo(frame.caption, 10);
  }
);

it("the final release position can cross the threshold after the last move event", async () => {
  vi.useFakeTimers();
  try {
    render(model({ itemSize: 100 }));
    await settle();
    fireEvent.touchStart(root(), { touches: point(100) });
    act(() => vi.advanceTimersByTime(100));
    fireEvent.touchMove(root(), { touches: point(80) });
    act(() => vi.advanceTimersByTime(200));
    fireEvent.touchEnd(root(), { changedTouches: point(60) });
    expect(state().index).toBe(1);
  } finally {
    vi.useRealTimers();
  }
});
it("native arrow callbacks compose with navigation instead of overriding it", async () => {
  const audit = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <Carousel itemSize={100}>
        <Carousel.Content>
          <Carousel.Item>A</Carousel.Item>
          <Carousel.Item>B</Carousel.Item>
        </Carousel.Content>
        <Carousel.Next onClick={audit} />
        <Carousel.Previous onClick={audit} />
        <Probe />
      </Carousel>
    </PanelUIProvider>
  );
  await settle();
  fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
  expect(state().index).toBe(1);
  expect(audit).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Previous slide" }));
  expect(state().index).toBe(0);
  expect(audit).toHaveBeenCalledTimes(2);
});
it("nonfinite initial indices normalize without poisoning the progress signal", async () => {
  const correction = vi.fn();
  render(model({ defaultIndex: Number.NaN, onIndexChange: correction }));
  await settle();
  expect(state().index).toBe(0);
  expect(correction).toHaveBeenCalledWith(0);
  expect(readTaroStyle(document.querySelector("#carousel-slide-0"))).toContain(
    "translateX(0rpx)"
  );
  expect(
    readTaroStyle(document.querySelector("#carousel-slide-0"))
  ).not.toContain("NaN");
});
