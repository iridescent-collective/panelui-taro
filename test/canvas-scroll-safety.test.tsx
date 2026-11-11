// @vitest-environment happy-dom
import { act, render } from "@testing-library/react";
import { createElement } from "react";
import { expect, it, vi } from "vitest";

import { useFlowEdgeCanvas } from "../src/components/Flow/use-edge-canvas";
import { useSignatureCanvas } from "../src/components/Signature/use-canvas";
import { useSketchCanvas } from "../src/components/Sketch/use-canvas";
import { useWaveCanvas } from "../src/components/Soundwave/use-canvas";
import { useOrbCanvas } from "../src/components/ThinkingOrb/use-canvas";
import { hasScrollAncestor } from "../src/platform/has-scroll-ancestor";
import { CanvasPaintActiveContext } from "../src/primitives/canvas-paint-context";
import { createObservableValue } from "../src/primitives/observable-value";
import { emitTestResize, setElementCanvasNode } from "./taro-api";

const signal = createObservableValue({
  clock: 0,
  energy: 0,
  samples: [],
  nextSample: 0,
});
const drawing = () => ({
  width: 100,
  height: 50,
  paths: [],
  ink: "black",
  stroke: 2,
  edge: 0,
  fade: false,
  hasProgress: false,
});
const useWave = () =>
  useWaveCanvas("visible-canvas", 100, 50, signal, undefined, drawing);
const useSignature = () =>
  useSignatureCanvas("visible-canvas", "export-canvas", {
    width: 100,
    height: 50,
    ink: "black",
    strokeWidth: 2,
    live: [],
    strokes: [],
  }).fallback;
const useSketch = () =>
  useSketchCanvas("visible-canvas", "export-canvas", {
    width: 100,
    height: 50,
    items: [],
    live: null,
    surface: "white",
  }).fallback;
const useFlow = () =>
  !useFlowEdgeCanvas("visible-canvas", {
    width: 100,
    height: 50,
    x: 0,
    y: 0,
    zoom: 1,
    drawings: [],
  });
it.each([
  { name: "Soundwave", useDrawing: useWave },
  { name: "Signature", useDrawing: useSignature },
  { name: "Sketch", useDrawing: useSketch },
  { name: "Flow", useDrawing: useFlow },
])(
  "$name retains native drawing inside a scrolling ancestor",
  async ({ useDrawing }) => {
    const context = {
      clearRect: vi.fn(),
      scale: vi.fn(),
      setTransform: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      quadraticCurveTo: vi.fn(),
      bezierCurveTo: vi.fn(),
      arc: vi.fn(),
      translate: vi.fn(),
      closePath: vi.fn(),
      createLinearGradient: vi.fn(),
    };
    const getContext = vi.fn(() => context);
    setElementCanvasNode("visible-canvas", { width: 0, height: 0, getContext });
    const Probe = () => {
      const fallback = useDrawing();
      return <canvas id="visible-canvas" data-fallback={String(fallback)} />;
    };
    const tree = render(
      createElement(
        "scroll-view",
        null,
        <div>
          <Probe />
        </div>
      )
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      tree.container.querySelector("canvas")?.getAttribute("data-fallback")
    ).toBe("false");
    expect(getContext).toHaveBeenCalled();
    act(() => emitTestResize());
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      tree.container.querySelector("canvas")?.getAttribute("data-fallback")
    ).toBe("false");
    expect(getContext).toHaveBeenCalled();
  }
);
it("detects scroll ancestry across nested wrappers without classifying standalone export nodes as scrolling", () => {
  const tree = render(
    <div>
      {createElement(
        "scroll-view",
        null,
        <div>
          <canvas id="nested-canvas" />
        </div>
      )}
      <canvas id="offscreen-export" />
    </div>
  );
  expect(hasScrollAncestor("nested-canvas")).toBe(true);
  expect(hasScrollAncestor("offscreen-export")).toBe(false);
  expect(hasScrollAncestor("missing-node")).toBe(false);
  tree.unmount();
});

const useOrb = () =>
  useOrbCanvas("visible-canvas", {
    state: "working",
    size: 50,
    speed: 1,
    paused: true,
    reduced: false,
    ink: "black",
  }).fallback;
it.each([
  { name: "Soundwave", useDrawing: useWave },
  { name: "Signature", useDrawing: useSignature },
  { name: "Sketch", useDrawing: useSketch },
  { name: "Flow", useDrawing: useFlow },
  { name: "ThinkingOrb", useDrawing: useOrb },
])(
  "$name releases native paint under a portal and binds it again after exit",
  async ({ useDrawing }) => {
    const context = Object.fromEntries(
      [
        "clearRect",
        "scale",
        "beginPath",
        "moveTo",
        "lineTo",
        "stroke",
        "quadraticCurveTo",
        "bezierCurveTo",
        "arc",
        "save",
        "restore",
        "translate",
        "closePath",
        "fill",
        "setTransform",
        "setLineDash",
      ].map((name) => [name, vi.fn()])
    );
    const getContext = vi.fn(() => ({
      ...context,
      createLinearGradient: () => ({ addColorStop: vi.fn() }),
    }));
    setElementCanvasNode("visible-canvas", { width: 0, height: 0, getContext });
    const Probe = () => (
      <canvas id="visible-canvas" data-fallback={String(useDrawing())} />
    );
    const App = ({ active }: { active: boolean }) => (
      <CanvasPaintActiveContext.Provider value={active}>
        <Probe />
      </CanvasPaintActiveContext.Provider>
    );
    const tree = render(<App active />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      tree.container.querySelector("canvas")?.getAttribute("data-fallback")
    ).toBe("false");
    const bindings = getContext.mock.calls.length;
    expect(bindings).toBeGreaterThan(0);
    context.clearRect.mockClear();
    tree.rerender(<App active={false} />);
    expect(
      tree.container.querySelector("canvas")?.getAttribute("data-fallback")
    ).toBe("true");
    expect(context.clearRect).toHaveBeenCalled();
    tree.rerender(<App active />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      tree.container.querySelector("canvas")?.getAttribute("data-fallback")
    ).toBe("false");
    expect(getContext.mock.calls.length).toBeGreaterThan(bindings);
  }
);
