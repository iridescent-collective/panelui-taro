// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { ImageGeneration } from "../src/components/ImageGeneration";
import {
  FIELD_OPACITY,
  MEDIA_OPACITY,
} from "../src/components/ImageGeneration/constants";
import {
  crossfadeAlphas,
  dotCount,
  FRAMES,
  framePhase,
  gridPath,
  litFrames,
  LIT_OPACITY,
} from "../src/components/ImageGeneration/dot-field";
import { fieldImageSource } from "../src/components/ImageGeneration/svg-source";
import { PanelUIProvider } from "../src/components/Provider";
import { setElementMeasurement, measurementStats } from "./taro-api";
import { readTaroStyle } from "./taro-style";

it("dot field preserves the source grid density, source motion loops and composited brightness", () => {
  expect(dotCount(1000, 800)).toBe(720);
  expect(gridPath(0, 100)).toBe("");
  for (const animation of ["drift", "pulse", "scan"] as const) {
    const frames = litFrames(200, 100, animation);
    expect(frames).toHaveLength(FRAMES);
    expect(new Set(frames).size).toBeGreaterThan(12);
    expect(framePhase(0, animation)).toBe(0);
  }
  for (const fraction of [0, 0.25, 0.5, 0.75, 1]) {
    const [a, b] = crossfadeAlphas(fraction);
    expect(1 - (1 - a) * (1 - b)).toBeCloseTo(LIT_OPACITY);
  }
});
it("all five statuses preserve field/media overlap, busy semantics and status text", () => {
  const tree = render(
    <PanelUIProvider reducedMotion>
      <ImageGeneration prompt="Sunset" status="queued" />
    </PanelUIProvider>
  );
  const statuses = [
    "queued",
    "generating",
    "refining",
    "complete",
    "error",
  ] as const;
  for (const status of statuses) {
    tree.rerender(
      <PanelUIProvider reducedMotion>
        <ImageGeneration prompt="Sunset" status={status} />
      </PanelUIProvider>
    );
    const frame = screen.getByRole("img");
    expect(frame.getAttribute("aria-busy")).toBe(
      String(status !== "complete" && status !== "error")
    );
    expect(readTaroStyle(frame.children[0] as HTMLElement)).toContain(
      `"opacity":${MEDIA_OPACITY[status]}`
    );
    expect(readTaroStyle(frame.children[1] as HTMLElement)).toContain(
      `"opacity":${FIELD_OPACITY[status]}`
    );
  }
});
it("retry is explicit, labels and status slots are configurable, and prompt survives hidden status", () => {
  const retry = vi.fn();
  const tree = render(
    <PanelUIProvider>
      <ImageGeneration
        status="error"
        label="Preview"
        prompt="Sunset"
        statusText="Failed"
        resolution=""
        onRetry={retry}
      />
    </PanelUIProvider>
  );
  fireEvent.click(screen.getByRole("button", { name: "Try again" }));
  expect(retry).toHaveBeenCalledOnce();
  expect(screen.getByRole("img", { name: "Preview" })).toBeTruthy();
  expect(screen.queryByText("1024 × 1024")).toBeNull();
  tree.rerender(
    <PanelUIProvider>
      <ImageGeneration status="complete" prompt="Sunset" showStatus={false} />
    </PanelUIProvider>
  );
  expect(screen.getByText("Sunset")).toBeTruthy();
  expect(screen.queryByText("Image ready")).toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
});
it("measured field holds the current clock on pause and cleans its interval on unmount", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("generation-field", {
      height: 120,
      left: 0,
      top: 0,
      width: 200,
    });
    const tree = render(
      <PanelUIProvider>
        <ImageGeneration.Field id="generation-field" />
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    const images = () =>
      tree.container.querySelectorAll<HTMLImageElement>(
        "#generation-field img"
      );
    expect(images()).toHaveLength(1);
    const first = images()[0].src;
    act(() => vi.advanceTimersByTime(240));
    expect(images()[0].src).not.toBe(first);
    tree.rerender(
      <PanelUIProvider>
        <ImageGeneration.Field id="generation-field" paused />
      </PanelUIProvider>
    );
    const held = images()[0].src;
    act(() => vi.advanceTimersByTime(1000));
    expect(images()[0].src).toBe(held);
    tree.rerender(
      <PanelUIProvider>
        <ImageGeneration.Field id="generation-field" />
      </PanelUIProvider>
    );
    act(() => vi.advanceTimersByTime(240));
    expect(images()[0].src).not.toBe(held);
    tree.unmount();
    expect(vi.getTimerCount()).toBe(0);
  } finally {
    vi.useRealTimers();
  }
});
it("SVG color attributes are escaped without adding markup", () => {
  const svg = decodeURIComponent(
    fieldImageSource("M0,0", 20, 20, '"/><script>bad</script>')
  );
  expect(svg).not.toContain("<script>");
  expect(svg).toContain("&quot;/&gt;&lt;script&gt;");
});
it("class-only size changes rebuild the field from the new measured dimensions", async () => {
  setElementMeasurement("resized-field", {
    height: 80,
    left: 0,
    top: 0,
    width: 100,
  });
  const tree = render(
    <PanelUIProvider>
      <ImageGeneration.Field
        id="resized-field"
        paused
        className="h-[160px] w-[200px]"
      />
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const source = () =>
    decodeURIComponent(
      tree.container
        .querySelector<HTMLImageElement>("#resized-field img")
        ?.getAttribute("src") ?? ""
    );
  expect(source()).toContain('viewBox="0 0 100 80"');
  setElementMeasurement("resized-field", {
    height: 120,
    left: 0,
    top: 0,
    width: 240,
  });
  tree.rerender(
    <PanelUIProvider>
      <ImageGeneration.Field
        id="resized-field"
        paused
        className="h-[240px] w-[480px]"
      />
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  expect(source()).toContain('viewBox="0 0 240 120"');
});
it("field opacity updates do not remeasure the same box every animation frame", async () => {
  vi.useFakeTimers();
  try {
    setElementMeasurement("efficient-field", {
      height: 120,
      left: 0,
      top: 0,
      width: 200,
    });
    const tree = render(
      <PanelUIProvider>
        <ImageGeneration.Field id="efficient-field" />
      </PanelUIProvider>
    );
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      await Promise.resolve();
    });
    const { queries } = measurementStats();
    for (let step = 0; step < 8; step += 1) {
      await act(async () => {
        vi.advanceTimersByTime(32);
        await Promise.resolve();
      });
    }
    expect(measurementStats().queries - queries).toBeLessThanOrEqual(1);
    tree.unmount();
  } finally {
    vi.useRealTimers();
  }
});
