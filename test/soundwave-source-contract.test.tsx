// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, render, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Soundwave } from "../src/components/Soundwave";
import { gradientStops, paintWave } from "../src/components/Soundwave/canvas";
import type { WaveContext } from "../src/components/Soundwave/canvas";
import {
  advanceWaveFrame,
  stillWaveFrame,
} from "../src/components/Soundwave/engine";
import {
  barsPath,
  linePath,
  pillHeight,
} from "../src/components/Soundwave/geometry";
import { idleEnergy } from "../src/components/Soundwave/math";
import type {
  SoundwaveState,
  WaveFrame,
} from "../src/components/Soundwave/types";
import { useWaveEngine } from "../src/components/Soundwave/use-engine";
import { IconColorProvider } from "../src/icons/context";
import { createObservableNumber } from "../src/primitives/observable-number";
import fixtures from "./fixtures/soundwave-source.json";
import {
  emitAppHide,
  emitAppShow,
  emitTestResize,
  setElementCanvasNode,
  setElementFieldsResult,
  setElementMeasurement,
} from "./taro-api";
import { readTaroStyle } from "./taro-style";

const frame = (clock = 0, energy = 0, samples: number[] = []): WaveFrame => ({
  clock,
  energy,
  nextSample: 0,
  samples,
});
const isState = (value: string): value is SoundwaveState =>
  ["idle", "listening", "thinking", "speaking"].includes(value);
const settle = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};
const measure = (id: string, width: number, height: number) =>
  setElementMeasurement(id, { height, left: 0, top: 0, width });
it.each(fixtures.pills)(
  "source capsule height at $clock / $energy with $count bars of $width",
  (sample) => {
    expect(
      Array.from({ length: sample.count }, (_, index) =>
        pillHeight(
          index,
          sample.count,
          sample.width,
          sample.height,
          frame(sample.clock, sample.energy)
        )
      )
    ).toEqual(sample.heights);
  }
);
it.each(fixtures.bars)(
  "source bars path count $count centered $centered scrolling $scrolling progress $progress",
  (sample) => {
    const geometry = {
      ...sample,
      frame: frame(sample.clock, sample.energy, sample.samples),
      progress: sample.progress ?? undefined,
    };
    expect([barsPath(geometry, false), barsPath(geometry, true)]).toEqual(
      sample.paths
    );
  }
);
it.each(fixtures.lines)(
  "source travelling line at $clock / $energy width $width",
  (sample) => {
    expect(
      linePath(
        frame(sample.clock, sample.energy),
        sample.width,
        sample.height,
        sample.strokeWidth
      )
    ).toBe(sample.path);
  }
);
it.each(fixtures.energies)(
  "source autonomous $state energy at $clock",
  (sample) => {
    if (!isState(sample.state)) {
      throw new Error("Unknown source soundwave state");
    }
    expect(idleEnergy(sample.state, sample.clock)).toBe(sample.energy);
  }
);
it("matches asymmetric attack/release, clamped dropped frames and accumulated speed changes", () => {
  const options = {
    history: 0,
    level: 1,
    paused: false,
    sensitivity: 1,
    speed: 1,
    state: "listening" as const,
  };
  const attacked = advanceWaveFrame(frame(), options, 16);
  expect(attacked.energy).toBe(0.256);
  expect(
    advanceWaveFrame(frame(1, 1), { ...options, level: 0 }, 16).energy
  ).toBe(0.92);
  expect(advanceWaveFrame(frame(), options, 1000).energy).toBe(0.768);
  expect(advanceWaveFrame(attacked, { ...options, speed: 2 }, 16).clock).toBe(
    0.048
  );
});
it("history samples at the source interval and retains the newest sample at the trailing edge", () => {
  const options = {
    history: 2,
    level: 1,
    paused: false,
    sensitivity: 1,
    speed: 1,
    state: "speaking" as const,
  };
  let value = frame();
  value = advanceWaveFrame(value, options, 16);
  expect(value.samples).toHaveLength(1);
  value = advanceWaveFrame(value, options, 16);
  expect(value.samples).toHaveLength(1);
  const [previous] = value.samples;
  for (let index = 0; index < 6; index += 1) {
    value = advanceWaveFrame(value, options, 16);
  }
  expect(value.samples).toHaveLength(2);
  expect(value.samples[0]).not.toBe(previous);
});
it("paused and reduced motion use the source representative energy and filled history", () => {
  const options = {
    history: 4,
    paused: true,
    sensitivity: 2,
    speed: 1,
    state: "idle" as const,
  };
  const still = stillWaveFrame(frame(2.4), options);
  expect(still.clock).toBe(2.4);
  expect(still.energy).toBe(0.42);
  expect(still.samples).toHaveLength(4);
  expect(stillWaveFrame(frame(), { ...options, level: 0.4 }).energy).toBe(0.8);
});
const wrapper = ({ children }: { children: ReactNode }) => (
  <PanelUIProvider>{children}</PanelUIProvider>
);
it("observable metering advances pixels without rendering the hook owner and stops in background", () => {
  vi.useFakeTimers();
  const level = createObservableNumber(1);
  const renders = vi.fn();
  const hook = renderHook(
    () => {
      renders();
      return useWaveEngine({
        history: 0,
        level,
        paused: false,
        sensitivity: 1,
        speed: 1,
        state: "listening",
      });
    },
    { wrapper }
  );
  act(() => vi.advanceTimersByTime(16));
  expect(hook.result.current.value.energy).toBe(0.256);
  act(() => {
    level.value = 0;
    vi.advanceTimersByTime(16);
  });
  expect(hook.result.current.value.energy).toBe(0.23552);
  expect(renders).toHaveBeenCalledOnce();
  act(() => emitAppHide());
  const { clock } = hook.result.current.value;
  act(() => vi.advanceTimersByTime(1000));
  expect(hook.result.current.value.clock).toBe(clock);
  act(() => {
    emitAppShow();
    vi.advanceTimersByTime(16);
  });
  expect(hook.result.current.value.clock).toBe(clock + 0.016);
  hook.unmount();
  expect(vi.getTimerCount()).toBe(0);
  vi.useRealTimers();
});
it("default pills retain source dimensions, per-state labels and inherited surface foreground", async () => {
  const tree = render(
    <PanelUIProvider reducedMotion>
      <IconColorProvider color="#fafafa">
        <Soundwave id="pill-wave" state="thinking" />
      </IconColorProvider>
    </PanelUIProvider>
  );
  await settle();
  const root = tree.container.querySelector("#pill-wave");
  expect(root?.getAttribute("aria-label")).toBe("Thinking");
  expect(readTaroStyle(root)).toContain('"height":"192rpx"');
  const pills = root?.firstElementChild?.children;
  expect(pills).toHaveLength(4);
  expect(readTaroStyle(pills?.[0])).toContain('"width":"56rpx"');
  expect(readTaroStyle(pills?.[0])).toContain('"backgroundColor":"#fafafa"');
});
const context = (): WaveContext &
  Pick<CanvasRenderingContext2D, "setTransform" | "save" | "restore"> => ({
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
  globalAlpha: 1,
  lineCap: "",
  lineJoin: "",
  lineTo: vi.fn(),
  lineWidth: 0,
  moveTo: vi.fn(),
  scale: vi.fn(),
  setTransform: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  stroke: vi.fn(),
  strokeStyle: "",
});
it("canvas respects source round paths, played/unplayed colour and transparent gradient edges", () => {
  const ctx = context();
  paintWave(ctx, {
    edge: 0.12,
    fade: true,
    gradient: ["#2563eb", "#7c3aed"],
    hasProgress: true,
    height: 56,
    ink: "#262626",
    paths: ["M1.5 5L1.5 40", "M30 2L30 50"],
    stroke: 3,
    track: "#999999",
    width: 240,
  });
  expect(ctx.moveTo).toHaveBeenNthCalledWith(1, 1.5, 5);
  expect(ctx.lineTo).toHaveBeenNthCalledWith(2, 30, 50);
  expect(ctx.stroke).toHaveBeenCalledTimes(2);
  expect(ctx.lineCap).toBe("round");
  expect(gradientStops(["#2563eb", "#7c3aed"], true, 0.12)).toEqual([
    { color: "#2563eb", offset: 0, opacity: 0 },
    { color: "#2563eb", offset: 0.12, opacity: 1 },
    { color: "#7c3aed", offset: 0.88, opacity: 1 },
    { color: "#7c3aed", offset: 1, opacity: 0 },
  ]);
});
it("native Canvas uses measured DPR and observable playhead redraws a stopped recorded waveform", async () => {
  vi.useFakeTimers();
  measure("recording-wave", 240, 56);
  measure("recording-wave-canvas", 240, 56);
  const ctx = context();
  const canvas = { getContext: () => ctx, height: 0, width: 0 };
  setElementCanvasNode("recording-wave-canvas", canvas);
  const progress = createObservableNumber(0);
  const tree = render(
    <PanelUIProvider>
      <Soundwave
        id="recording-wave"
        variant="bars"
        levels={[0.2, 0.8, 0.4]}
        progress={progress}
      />
    </PanelUIProvider>
  );
  await settle();
  expect(canvas.width).toBe(480);
  expect(canvas.height).toBe(112);
  expect(ctx.scale).toHaveBeenCalledWith(2, 2);
  expect(vi.getTimerCount()).toBe(0);
  const strokes = vi.mocked(ctx.stroke).mock.calls.length;
  act(() => {
    progress.value = 0.5;
  });
  act(() => vi.advanceTimersByTime(16));
  expect(vi.mocked(ctx.stroke).mock.calls.length).toBe(strokes + 2);
  tree.unmount();
  act(() => {
    progress.value = 1;
  });
  expect(vi.mocked(ctx.stroke).mock.calls.length).toBe(strokes + 2);
  vi.useRealTimers();
});
it("a missing Canvas node falls back to a complete SVG including gradient and unplayed path", async () => {
  measure("missing-wave", 240, 56);
  setElementFieldsResult("missing-wave-canvas", null);
  const tree = render(
    <PanelUIProvider reducedMotion>
      <Soundwave
        id="missing-wave"
        variant="bars"
        progress={0.5}
        gradient={["#2563eb", "#7c3aed"]}
      />
    </PanelUIProvider>
  );
  await settle();
  const src = tree.container.querySelector("img")?.getAttribute("src");
  const svg = decodeURIComponent(src?.split(",")[1] ?? "");
  expect(svg).toContain("<linearGradient");
  expect(svg.match(/<path /gu)).toHaveLength(2);
  expect(svg).toContain('stroke-opacity="0.3"');
});
it("ambient follows info colour rather than surface foreground and keeps its three source rim rings", async () => {
  const tree = render(
    <PanelUIProvider reducedMotion>
      <IconColorProvider color="#fafafa">
        <Soundwave
          id="ambient-wave"
          variant="ambient"
          radius={32}
          style={{ height: "400rpx" }}
        />
      </IconColorProvider>
    </PanelUIProvider>
  );
  await settle();
  const ambient = tree.container.querySelector("#ambient-wave");
  expect(readTaroStyle(ambient)).toContain('"pointerEvents":"none"');
  expect(ambient?.firstElementChild?.firstElementChild?.children).toHaveLength(
    3
  );
  expect(
    readTaroStyle(ambient?.firstElementChild?.lastElementChild)
  ).not.toContain("250, 250, 250");
});
it("resizing redraws bars with new native dimensions and explicit token colour wins over inherited ink", async () => {
  measure("resize-wave", 100, 56);
  const tree = render(
    <PanelUIProvider reducedMotion>
      <IconColorProvider color="#fafafa">
        <Soundwave id="resize-wave" variant="bars" color="--color-info" />
      </IconColorProvider>
    </PanelUIProvider>
  );
  await settle();
  let image = tree.container.querySelector("img");
  expect(readTaroStyle(image)).toContain('"width":"200rpx"');
  measure("resize-wave", 200, 56);
  act(() => emitTestResize());
  await settle();
  image = tree.container.querySelector("img");
  expect(readTaroStyle(image)).toContain('"width":"400rpx"');
  const svg = decodeURIComponent(
    image?.getAttribute("src")?.split(",")[1] ?? ""
  );
  expect(svg).not.toContain("#fafafa");
});
it("each played path retains the source SVG object-bounding-box gradient rather than stretching both across the viewport", () => {
  const ctx = context();
  paintWave(ctx, {
    edge: 0.12,
    fade: true,
    gradient: ["#2563eb", "#7c3aed"],
    hasProgress: true,
    height: 56,
    ink: "#262626",
    paths: ["M1.5 5L1.5 40M30 5L30 40", "M60 2L60 50M90 2L90 50"],
    stroke: 3,
    width: 240,
  });
  expect(ctx.createLinearGradient).toHaveBeenNthCalledWith(1, 1.5, 0, 30, 0);
  expect(ctx.createLinearGradient).toHaveBeenNthCalledWith(2, 60, 0, 90, 0);
});
it("an empty palette uses explicit ink for Canvas edge fade like an omitted source gradient", () => {
  const ctx = context();
  const stops = { addColorStop: vi.fn() };
  ctx.createLinearGradient = () => stops;
  paintWave(ctx, {
    edge: 0.18,
    fade: true,
    gradient: [],
    hasProgress: false,
    height: 30,
    ink: "#ffffff",
    paths: ["M0 10L100 20"],
    stroke: 3,
    width: 100,
  });
  expect(stops.addColorStop).toHaveBeenCalledWith(0.18, "#ffffff");
});
it("an empty palette uses explicit ink for SVG fallback edge fade", async () => {
  measure("empty-palette", 100, 72);
  const tree = render(
    <PanelUIProvider reducedMotion>
      <Soundwave
        id="empty-palette"
        variant="line"
        gradient={[]}
        color="#ffffff"
      />
    </PanelUIProvider>
  );
  await settle();
  const svg = decodeURIComponent(
    tree.container.querySelector("img")?.getAttribute("src")?.split(",")[1] ??
      ""
  );
  expect(svg).toContain('stop-color="#ffffff"');
  expect(svg).not.toContain('stop-color="#000000"');
});
