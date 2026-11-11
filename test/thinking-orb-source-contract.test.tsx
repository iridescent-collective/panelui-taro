// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, render, screen } from "@testing-library/react";
import { createElement } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { ThinkingOrb } from "../src/components/ThinkingOrb";
import type { ThinkingOrbState } from "../src/components/ThinkingOrb";
import {
  paintOrbPaths,
  readOrbCanvas,
} from "../src/components/ThinkingOrb/canvas";
import { PROFILES } from "../src/components/ThinkingOrb/constants";
import { renderFrame } from "../src/components/ThinkingOrb/geometry";
import {
  normalizeOrbSize,
  normalizeOrbSpeed,
} from "../src/components/ThinkingOrb/use-canvas";
import fixtures from "./fixtures/thinking-orb-source.json";
import {
  emitAppHide,
  emitAppShow,
  setElementCanvasNode,
  setElementMeasurement,
  setElementFieldsResult,
} from "./taro-api";

const settle = async () => {
  await act(async () => {
    await Promise.resolve();
  });
};
const isState = (state: string): state is ThinkingOrbState =>
  Object.hasOwn(PROFILES, state);
const createContext = () => ({
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  fill: vi.fn(),
  fillStyle: "",
  globalAlpha: 1,
  moveTo: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
});
const createCanvas = (id: string) => {
  const context = createContext();
  const canvas = { getContext: () => context, height: 0, width: 0 };
  setElementCanvasNode(`${id}-canvas`, canvas);
  setElementMeasurement(`${id}-canvas`, {
    height: 64,
    left: 0,
    top: 0,
    width: 64,
  });
  return { canvas, context };
};
const drawLiveOrb = (paused: boolean, speed: number) => (
  <PanelUIProvider>
    <ThinkingOrb id="live-orb" state="working" paused={paused} speed={speed} />
  </PanelUIProvider>
);
it.each(fixtures.samples)(
  "$state/$size/$time preserves all eight paths from the pinned upstream geometry",
  (sample) => {
    if (!isState(sample.state)) {
      throw new Error("Unknown fixture state");
    }
    expect(
      renderFrame(
        sample.state,
        sample.size,
        sample.time,
        PROFILES[sample.state][sample.size <= 32 ? "sm" : "md"]
      )
    ).toEqual(sample.paths);
  }
);
it("native canvas paints grouped circles in bucket order, with source radii and quantized centres", () => {
  const context = createContext();
  const [sample] = fixtures.samples;
  paintOrbPaths(context, sample.paths, sample.size, "#123456");
  expect(context.clearRect).toHaveBeenCalledWith(
    0,
    0,
    sample.size,
    sample.size
  );
  expect(context.fillStyle).toBe("#123456");
  expect(context.beginPath).toHaveBeenCalledTimes(8);
  expect(context.fill).toHaveBeenCalledTimes(8);
  expect(context.arc.mock.calls).toHaveLength(
    sample.paths.join("").split("M").length - 1
  );
  expect(context.globalAlpha).toBe(1);
});
it("a reduced orb paints the source representative frame at DPR and carries one accessible state label", async () => {
  const { canvas, context } = createCanvas("still-orb");
  const view = render(
    <PanelUIProvider reducedMotion>
      <ThinkingOrb id="still-orb" state="shaping" size={64} color="#123456" />
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getByRole("img", { name: "Shaping" })).toBeTruthy();
  expect(canvas.width).toBe(128);
  expect(canvas.height).toBe(128);
  expect(context.scale).toHaveBeenCalledWith(2, 2);
  const expected = createContext();
  paintOrbPaths(
    expected,
    renderFrame("shaping", 64, 2.4, PROFILES.shaping.md),
    64,
    "#123456"
  );
  expect(context.arc.mock.calls.slice(-expected.arc.mock.calls.length)).toEqual(
    expected.arc.mock.calls
  );
  view.unmount();
});
it("pause freezes the last frame, changing speed does not reset phase, and background timers stop until resumed", async () => {
  vi.useFakeTimers();
  try {
    const { context } = createCanvas("live-orb");
    const view = render(drawLiveOrb(false, 1));
    await settle();
    act(() => vi.advanceTimersByTime(64));
    view.rerender(drawLiveOrb(true, 1));
    act(() => vi.advanceTimersByTime(16));
    const snapshot = context.arc.mock.calls.slice(
      -context.arc.mock.calls.length
    );
    const count = context.arc.mock.calls.length;
    act(() => vi.advanceTimersByTime(200));
    expect(context.arc.mock.calls).toHaveLength(count);
    view.rerender(drawLiveOrb(false, 2));
    act(() => vi.advanceTimersByTime(16));
    const first = context.arc.mock.calls.slice(count);
    expect(first).toEqual(snapshot.slice(-first.length));
    act(emitAppHide);
    const hiddenCount = context.arc.mock.calls.length;
    act(() => vi.advanceTimersByTime(1000));
    expect(context.arc.mock.calls).toHaveLength(hiddenCount);
    act(emitAppShow);
    await settle();
    act(() => vi.advanceTimersByTime(16));
    expect(context.arc.mock.calls.length).toBeGreaterThan(hiddenCount);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("unsupported canvas retains a static eight-path fallback and invalid speed/size cannot poison shape maths", async () => {
  expect(readOrbCanvas(null)).toBeNull();
  expect(normalizeOrbSpeed(-1)).toBe(0);
  expect(normalizeOrbSpeed(Number.NaN)).toBe(0);
  expect(normalizeOrbSize(Number.POSITIVE_INFINITY)).toBe(0);
  render(
    <PanelUIProvider reducedMotion>
      <ThinkingOrb
        state="searching"
        size={20}
        accessibilityLabel="Search in progress"
      />
    </PanelUIProvider>
  );
  await settle();
  expect(screen.getByRole("img", { name: "Search in progress" })).toBeTruthy();
  const image = document.querySelector("img");
  const svg = decodeURIComponent(
    image?.getAttribute("src")?.split(",")[1] ?? ""
  );
  expect(svg.match(/<path /gu)).toHaveLength(8);
  expect(svg).not.toContain("NaN");
});
it("native frame timestamps clamp a hitch to 48ms without resetting the accumulated source phase", async () => {
  const context = createContext();
  const frames = new Map<number, (time: number) => void>();
  let sequence = 0;
  const canvas = {
    cancelAnimationFrame: (id: number) => {
      frames.delete(id);
    },
    getContext: () => context,
    height: 0,
    requestAnimationFrame: (frame: (time: number) => void) => {
      sequence += 1;
      frames.set(sequence, frame);
      return sequence;
    },
    width: 0,
  };
  setElementCanvasNode("raf-orb-canvas", canvas);
  setElementMeasurement("raf-orb-canvas", {
    height: 64,
    left: 0,
    top: 0,
    width: 64,
  });
  const view = render(
    <PanelUIProvider>
      <ThinkingOrb id="raf-orb" />
    </PanelUIProvider>
  );
  await settle();
  const runFrame = (time: number) => {
    const [entry] = frames;
    if (!entry) {
      throw new Error("No native frame scheduled");
    }
    frames.delete(entry[0]);
    act(() => entry[1](time));
  };
  runFrame(100);
  runFrame(1100);
  const expected = createContext();
  paintOrbPaths(
    expected,
    renderFrame(
      "working",
      64,
      0.064 * PROFILES.working.md.speed,
      PROFILES.working.md
    ),
    64,
    context.fillStyle
  );
  expect(context.arc.mock.calls.slice(-expected.arc.mock.calls.length)).toEqual(
    expected.arc.mock.calls
  );
  view.unmount();
  expect(frames.size).toBe(0);
});

it("a null native node query shows the representative SVG fallback instead of staying blank", async () => {
  setElementFieldsResult("missing-orb-canvas", null);
  render(
    <PanelUIProvider reducedMotion>
      <ThinkingOrb id="missing-orb" state="solving" />
    </PanelUIProvider>
  );
  await settle();
  const image = document.querySelector("img");
  expect(image).not.toBeNull();
  const svg = decodeURIComponent(
    image?.getAttribute("src")?.split(",")[1] ?? ""
  );
  expect(svg.match(/<path /gu)).toHaveLength(8);
  expect(svg).toContain("M");
});

it("scroll containers keep a single native Canvas and pause without SVG frame replacement", async () => {
  vi.useFakeTimers();
  try {
    const { context } = createCanvas("scroll-orb");
    const element = (paused: boolean) => (
      <PanelUIProvider>
        {createElement(
          "scroll-view",
          null,
          <ThinkingOrb id="scroll-orb" state="searching" paused={paused} />
        )}
      </PanelUIProvider>
    );
    const tree = render(element(false));
    await settle();
    const host = tree.container.querySelector("canvas");
    expect(host).not.toBeNull();
    expect(tree.container.querySelector("img")).toBeNull();
    const initial = context.fill.mock.calls.length;
    act(() => vi.advanceTimersByTime(100));
    expect(context.fill.mock.calls.length).toBeGreaterThan(initial);
    tree.rerender(element(true));
    act(() => vi.advanceTimersByTime(16));
    const count = context.fill.mock.calls.length;
    act(() => vi.advanceTimersByTime(200));
    expect(context.fill.mock.calls.length).toBe(count);
    expect(tree.container.querySelector("canvas")).toBe(host);
    expect(tree.container.querySelector("img")).toBeNull();
    tree.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});

it.each([
  { state: "searching" as const, size: 20 },
  { state: "composing" as const, size: 56 },
])(
  "scrolling $state/$size pauses the compatibility snapshot without image-frame churn",
  async ({ state, size }) => {
    vi.useFakeTimers();
    try {
      const tree = render(
        <PanelUIProvider>
          {createElement(
            "scroll-view",
            null,
            <ThinkingOrb state={state} size={size} />
          )}
        </PanelUIProvider>
      );
      await settle();
      act(() => vi.advanceTimersByTime(100));
      const profile = PROFILES[state][size <= 32 ? "sm" : "md"];
      const path = renderFrame(state, size, 0, profile).find(Boolean);
      expect(path).toBeTruthy();
      expect(
        decodeURIComponent(
          tree.container.querySelector("img")?.getAttribute("src") ?? ""
        )
      ).toContain(`d="${path}"`);
    } finally {
      vi.useRealTimers();
    }
  }
);
