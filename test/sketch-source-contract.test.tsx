// @vitest-environment happy-dom
import "./geometry-renderer";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { createRef, StrictMode } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Sketch } from "../src/components/Sketch";
import type { SketchHandle, SketchItem } from "../src/components/Sketch";
import { paintSketchItems } from "../src/components/Sketch/canvas";
import type { SketchInkContext } from "../src/components/Sketch/canvas";
import {
  shapePath,
  strokePath,
  svgDocument,
} from "../src/components/Sketch/math";
import {
  SizeSlider,
  sliderFraction,
} from "../src/components/Sketch/size-slider";
import { useSketchModel } from "../src/components/Sketch/use-model";
import { THEME_TOKENS } from "../src/theme/tokens";
import FIXTURES from "./fixtures/sketch-source.json";
import { deferred } from "./helpers/deferred";
import {
  canvasToTempFilePath,
  setElementCanvasNode,
  setElementMeasurement,
  setTestMeasurement,
  showActionSheet,
} from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";

it.each(FIXTURES.shapes)("matches pinned shape $shape geometry %#", (frame) =>
  expect(
    shapePath(
      frame.shape,
      frame.rectangle[0],
      frame.rectangle[1],
      frame.rectangle[2],
      frame.rectangle[3],
      frame.width
    )
  ).toBe(frame.output)
);
it.each(FIXTURES.strokes)("matches pinned stroke %#", (frame) =>
  expect(strokePath(frame.points)).toBe(frame.output)
);
it.each(FIXTURES.documents)(
  "matches pinned sequential eraser masks %#",
  (frame) =>
    expect(
      svgDocument(frame.items as SketchItem[], 320.4, 200.8, "sketch-test")
    ).toBe(frame.output)
);
it("escapes consumer color values in exported SVG attributes", () => {
  const svg = svgDocument(
    [
      {
        color: 'red"/><script>alert(1)</script><path stroke="red',
        d: "M1,2 l0.01,0",
        type: "stroke",
        width: 6,
      },
    ],
    320,
    200,
    "safe"
  );
  expect(svg).not.toContain("<script>");
  expect(svg).toContain("&quot;");
});
const point = (x: number, y: number) => ({ identifier: 1, x, y });
const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const node = () => {
  const context = {
    arc: vi.fn(),
    beginPath: vi.fn(),
    bezierCurveTo: vi.fn(),
    clearRect: vi.fn(),
    closePath: vi.fn(),
    globalCompositeOperation: "source-over",
    lineCap: "round",
    lineJoin: "round",
    lineTo: vi.fn(),
    lineWidth: 0,
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    scale: vi.fn(),
    setTransform: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: "",
    translate: vi.fn(),
  };
  return { context, node: { getContext: () => context, height: 0, width: 0 } };
};
const draw = (canvas: Element, from = [10, 20], to = [30, 40]) => {
  fireEvent.touchStart(canvas, { touches: [point(from[0], from[1])] });
  fireEvent.touchMove(canvas, { touches: [point(to[0], to[1])] });
  fireEvent.touchEnd(canvas);
};
it("preserves pen, shape selection, eraser history, done and same-frame undo exports", async () => {
  setTestMeasurement(320, 375);
  const ref = createRef<SketchHandle>();
  const done = vi.fn();
  const change = vi.fn();
  render(
    <PanelUIProvider>
      <Sketch ref={ref} onDone={done} onChange={change} />
    </PanelUIProvider>
  );
  await settle();
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing drawing surface");
  }
  draw(canvas);
  fireEvent.click(screen.getByRole("tab", { name: "Shapes" }));
  fireEvent.click(screen.getByRole("button", { name: "Heart" }));
  draw(canvas);
  fireEvent.click(screen.getByRole("tab", { name: "Eraser" }));
  draw(canvas);
  fireEvent.click(screen.getByRole("button", { name: "Done" }));
  expect(
    done.mock.calls[0][0].items.map((item: SketchItem) => item.type)
  ).toEqual(["stroke", "shape", "erase"]);
  expect(done.mock.calls[0][0].svg).toContain("<mask");
  act(() => {
    ref.current?.undo();
    ref.current?.undo();
    expect(ref.current?.toSVG()).not.toContain("<mask");
    expect(ref.current?.toSVG()).not.toContain(" C");
    ref.current?.clear();
    expect(ref.current?.isEmpty()).toBe(true);
    expect(ref.current?.toSVG()).not.toContain("<path");
  });
  expect(change).toHaveBeenLastCalledWith(0);
});
it("rejects tiny shapes and applies native touch averages and single normalization", async () => {
  setTestMeasurement(640, 750);
  const ref = createRef<SketchHandle>();
  render(
    <PanelUIProvider>
      <Sketch ref={ref} defaultTool="shape" defaultShape="rectangle" />
    </PanelUIProvider>
  );
  await settle();
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing canvas");
  }
  draw(canvas, [20, 40], [24, 44]);
  expect(ref.current?.isEmpty()).toBe(true);
  fireEvent.touchStart(canvas, {
    touches: [point(20, 40), { identifier: 2, x: 40, y: 60 }],
  });
  fireEvent.touchMove(canvas, {
    touches: [point(60, 80), { identifier: 2, x: 80, y: 100 }],
  });
  fireEvent.touchEnd(canvas);
  expect(ref.current?.toSVG()).toContain('d="M15,25 H35 V45 H15 Z"');
});
it("exports native PNG from the requested history snapshot and preserves eraser composition", async () => {
  setTestMeasurement(320, 375);
  const ref = createRef<SketchHandle>();
  render(
    <PanelUIProvider>
      <Sketch ref={ref} />
    </PanelUIProvider>
  );
  await settle();
  const [live, exported] = document.querySelectorAll("canvas");
  expect(exported.style.left).toBe("-10000px");
  expect(exported.style.top).toBe("-10000px");
  expect(exported.className).toContain("absolute h-full w-full");
  expect(exported.className).not.toContain("inset-0");
  expect(exported.style.opacity).not.toBe("0");
  expect(exported.style.display).not.toBe("none");
  const output = node();
  setElementCanvasNode(exported.id, output.node);
  draw(live);
  let pending: Promise<string> | undefined;
  act(() => {
    pending = ref.current?.toPNG({ scale: 3 });
    ref.current?.clear();
  });
  expect(await pending).toBe("wxfile://signature-temp.png");
  expect(output.context.quadraticCurveTo).toHaveBeenCalledWith(10, 20, 20, 30);
  expect(canvasToTempFilePath).toHaveBeenCalledWith(
    expect.objectContaining({ destWidth: 960, fileType: "png" }),
    expect.anything()
  );
  const operations: string[] = [];
  const ctx = node().context;
  ctx.stroke.mockImplementation(() => {
    operations.push(ctx.globalCompositeOperation);
  });
  paintSketchItems(ctx as SketchInkContext, [
    { color: "#000", d: "M1,2 l0.01,0", type: "stroke", width: 6 },
    { d: "M1,2 L3,4", type: "erase", width: 15 },
    {
      color: "#fff",
      d: shapePath(3, 10, 20, 50, 60, 6),
      shape: "ellipse",
      type: "shape",
      width: 6,
    },
  ]);
  expect(operations).toEqual(["source-over", "destination-out", "source-over"]);
  expect(ctx.arc).toHaveBeenCalledTimes(2);
  expect(ctx.globalCompositeOperation).toBe("source-over");
});
it("retains source stroke slider geometry and bounded endpoints", () => {
  expect(sliderFraction(14, 140)).toBe(1);
  expect(sliderFraction(154, 140)).toBe(0);
  expect(sliderFraction(84, 140)).toBe(0.5);
  expect(sliderFraction(-100, 140)).toBe(1);
});
it("stroke width menu works after StrictMode effect replay", async () => {
  const change = vi.fn();
  render(
    <StrictMode>
      <PanelUIProvider>
        <SizeSlider
          value={5}
          min={1}
          max={21}
          color="#000"
          scale={1}
          onChange={change}
        />
      </PanelUIProvider>
    </StrictMode>
  );
  act(() =>
    dispatchTaroEvent(
      screen.getByLabelText("Stroke width"),
      TARO_TEST_EVENTS.longPress,
      {}
    )
  );
  await settle();
  expect(change).toHaveBeenCalledExactlyOnceWith(7);
});
it.each(["value", "min", "max", "callback"] as const)(
  "rejects stale stroke menu after %s changes",
  async (kind) => {
    const pendingMenu = deferred<{ tapIndex: number }>();
    const { promise } = pendingMenu;
    showActionSheet.mockReturnValueOnce(promise);
    const change = vi.fn();
    const replacement = vi.fn();
    const initial = { max: 21, min: 1, onChange: change, value: 5 };
    const props = {
      ...initial,
      ...(kind === "value" ? { value: 9 } : {}),
      ...(kind === "min" ? { min: 2 } : {}),
      ...(kind === "max" ? { max: 41 } : {}),
      ...(kind === "callback" ? { onChange: replacement } : {}),
    };
    const result = render(
      <PanelUIProvider>
        <SizeSlider {...initial} color="#000" scale={1} />
      </PanelUIProvider>
    );
    act(() =>
      dispatchTaroEvent(
        screen.getByLabelText("Stroke width"),
        TARO_TEST_EVENTS.longPress,
        {}
      )
    );
    result.rerender(
      <PanelUIProvider>
        <SizeSlider {...props} color="#000" scale={1} />
      </PanelUIProvider>
    );
    await act(async () => {
      pendingMenu.resolve({ tapIndex: 0 });
      await promise;
    });
    expect(change).not.toHaveBeenCalled();
    expect(replacement).not.toHaveBeenCalled();
  }
);
it.each(["pen", "shape", "eraser"] as const)(
  "PNG includes visible live %s but SVG remains committed",
  async (tool) => {
    setTestMeasurement(320, 375);
    const ref = createRef<SketchHandle>();
    render(
      <PanelUIProvider>
        <Sketch ref={ref} defaultTool={tool} defaultShape="rectangle" />
      </PanelUIProvider>
    );
    await settle();
    const [live, exported] = document.querySelectorAll("canvas");
    const output = node();
    setElementCanvasNode(exported.id, output.node);
    const strokes: { color: string; operation: string }[] = [];
    output.context.stroke.mockImplementation(() => {
      strokes.push({
        color: output.context.strokeStyle,
        operation: output.context.globalCompositeOperation,
      });
    });
    fireEvent.touchStart(live, { touches: [point(10, 20)] });
    fireEvent.touchMove(live, { touches: [point(30, 40)] });
    expect(ref.current?.toSVG()).not.toContain("<path");
    const pending = ref.current?.toPNG();
    act(() => ref.current?.clear());
    await pending;
    expect(output.context.stroke).toHaveBeenCalledOnce();
    expect(strokes[0]?.operation).toBe("source-over");
    if (tool === "eraser") {
      expect(strokes[0]?.color).toBe(THEME_TOKENS.light.popover);
    }
    if (tool === "shape") {
      expect(output.context.lineTo).toHaveBeenCalledWith(30, 20);
    } else {
      expect(output.context.quadraticCurveTo).toHaveBeenCalledWith(
        10,
        20,
        20,
        30
      );
    }
  }
);

it("stroke slider uses its current viewport origin after its parent scrolls", async () => {
  const change = vi.fn();
  render(
    <PanelUIProvider reducedMotion>
      <SizeSlider
        value={6}
        min={2}
        max={24}
        color="#000"
        scale={1}
        onChange={change}
      />
    </PanelUIProvider>
  );
  await settle();
  const slider = screen.getByLabelText("Stroke width");
  setElementMeasurement(slider.id, {
    height: 148.06,
    left: 0,
    top: 200,
    width: 48,
  });
  const contactPoint = { clientX: 10, clientY: 274.03, identifier: 1 };
  fireEvent.touchStart(slider, { touches: [contactPoint] });
  fireEvent.touchEnd(slider, { changedTouches: [contactPoint] });
  await settle();
  expect(change).toHaveBeenCalledExactlyOnceWith(13);
});

const requiredElement = <T extends Element>(
  element: T | null | undefined
): T => {
  if (!element) {
    throw new Error("Missing Sketch layer");
  }
  return element;
};
it("keeps native ink below slider, dismiss layer and opaque tool cards", async () => {
  const style = document.createElement("style");
  style.textContent =
    ".isolate{isolation:isolate}.z-0{z-index:0}.z-10{z-index:10}.z-20{z-index:20}.z-30{z-index:30}";
  document.head.append(style);
  try {
    setTestMeasurement(320, 375);
    const ref = createRef<SketchHandle>();
    render(
      <PanelUIProvider>
        <Sketch ref={ref} />
      </PanelUIProvider>
    );
    await settle();
    const surface = screen.getByLabelText("Drawing canvas, empty");
    const stage = requiredElement(surface.parentElement);
    expect(getComputedStyle(stage).isolation).toBe("isolate");
    expect(getComputedStyle(surface).zIndex).toBe("0");
    const slider = screen.getByLabelText("Stroke width");
    expect(getComputedStyle(requiredElement(slider.parentElement)).zIndex).toBe(
      "10"
    );
    const canvas = requiredElement(surface.querySelector("canvas"));
    draw(canvas);
    fireEvent.click(screen.getByRole("tab", { name: "Shapes" }));
    const dismiss = screen.getByRole("button", { name: "Close" });
    const shapes = requiredElement(
      screen.getByRole("button", { name: "Line" }).parentElement?.parentElement
    );
    expect(getComputedStyle(dismiss).zIndex).toBe("20");
    expect(getComputedStyle(shapes).zIndex).toBe("30");
    expect(shapes.className).toContain("bg-[var(--panel-popover)]");
    fireEvent.click(dismiss);
    expect(screen.queryByRole("button", { name: "Line" })).toBeNull();
    draw(canvas, [50, 60], [70, 80]);
    expect(screen.getByLabelText("Drawing canvas, 2 marks")).toBe(surface);
    expect(ref.current?.toSVG().match(/<path/gu)).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "Custom colour" }));
    const colorCard = screen.getByLabelText("Hue").closest(".z-30");
    expect(colorCard).not.toBeNull();
    expect(getComputedStyle(requiredElement(colorCard)).zIndex).toBe("30");
  } finally {
    style.remove();
  }
});

it.each(["Shapes", "Custom colour"])(
  "uses ordinary SVG ink beneath the %s card while preserving the native canvas",
  async (label) => {
    setTestMeasurement(320, 375);
    const ref = createRef<SketchHandle>();
    render(
      <PanelUIProvider>
        <Sketch ref={ref} />
      </PanelUIProvider>
    );
    const surface = screen.getByLabelText("Drawing canvas, empty");
    const canvas = requiredElement(surface.querySelector("canvas"));
    setElementCanvasNode(canvas.id, node().node);
    await settle();
    expect(surface.querySelector('img[mode="scaleToFill"]')).toBeNull();
    draw(canvas);
    fireEvent.click(screen.getByRole("tab", { name: "Eraser" }));
    draw(canvas, [15, 25], [20, 30]);
    fireEvent.click(screen.getByRole("tab", { name: "Pen" }));
    const before = ref.current?.toSVG();
    expect(before).toContain("<mask");
    fireEvent.click(
      screen.getByRole(label === "Shapes" ? "tab" : "button", { name: label })
    );
    expect(canvas.style.left).toBe("-10000px");
    expect(canvas.style.top).toBe("-10000px");
    expect(canvas.className).toContain("h-full w-full");
    const snapshot = requiredElement(
      surface.querySelector('img[mode="scaleToFill"]')
    );
    expect(decodeURIComponent(snapshot.getAttribute("src") ?? "")).toBe(
      `data:image/svg+xml,${before}`
    );
    draw(canvas, [50, 60], [70, 80]);
    expect(ref.current?.toSVG()).toBe(before);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(surface.querySelector("canvas")).toBe(canvas);
    expect(canvas.style.left).toBe("");
    expect(canvas.style.top).toBe("");
    expect(canvas.className).toContain("inset-0");
    expect(surface.querySelector('img[mode="scaleToFill"]')).toBeNull();
    draw(canvas, [50, 60], [70, 80]);
    expect(screen.getByLabelText("Drawing canvas, 3 marks")).toBe(surface);
  }
);

it.each(["Shapes", "Custom colour"])(
  "commits active ink before opening %s and never resumes an orphan gesture",
  async (label) => {
    setTestMeasurement(320, 375);
    const ref = createRef<SketchHandle>();
    const done = vi.fn();
    render(
      <PanelUIProvider>
        <Sketch ref={ref} onDone={done} />
      </PanelUIProvider>
    );
    const [canvas, exported] = document.querySelectorAll("canvas");
    setElementCanvasNode(canvas.id, node().node);
    const output = node();
    setElementCanvasNode(exported.id, output.node);
    await settle();
    fireEvent.touchStart(canvas, { touches: [point(10, 20)] });
    fireEvent.touchMove(canvas, { touches: [point(30, 40)] });
    fireEvent.click(
      screen.getByRole(label === "Shapes" ? "tab" : "button", { name: label })
    );
    expect(screen.getByLabelText("Drawing canvas, 1 marks")).toBeTruthy();
    const committed = ref.current?.toSVG();
    expect(committed?.match(/<path/gu)).toHaveLength(1);
    const snapshot = requiredElement(
      canvas.parentElement?.querySelector('img[mode="scaleToFill"]')
    );
    expect(decodeURIComponent(snapshot.getAttribute("src") ?? "")).toBe(
      `data:image/svg+xml,${committed}`
    );
    expect(await ref.current?.toPNG()).toBe("wxfile://signature-temp.png");
    expect(output.context.quadraticCurveTo).toHaveBeenCalledExactlyOnceWith(
      10,
      20,
      20,
      30
    );
    fireEvent.touchEnd(canvas);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.touchMove(canvas, { touches: [point(90, 100)] });
    fireEvent.touchEnd(canvas);
    expect(ref.current?.toSVG()).toBe(committed);
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(done.mock.calls[0][0].items).toHaveLength(1);
    expect(done.mock.calls[0][0].svg).toBe(committed);
    draw(canvas, [50, 60], [70, 80]);
    expect(screen.getByLabelText("Drawing canvas, 2 marks")).toBeTruthy();
  }
);

it("resolves consecutive batched card toggles against the preceding request", () => {
  const { result } = renderHook(() => useSketchModel({}, null));
  const model = result.current;
  act(() => {
    model.pickTool("shape");
    model.pickTool("shape");
  });
  expect(result.current.card).toBeNull();
});
it("resolves retained card setters against the latest requested state", () => {
  const { result } = renderHook(() => useSketchModel({}, null));
  const retained = result.current.setCard;
  act(() => result.current.setCard("color"));
  act(() => retained((value) => (value === "color" ? null : "color")));
  expect(result.current.card).toBeNull();
});

it("a native sheet keeps its declared height as the CSS flex basis", async () => {
  render(
    <PanelUIProvider reducedMotion>
      <Sketch.Sheet open native />
    </PanelUIProvider>
  );
  await act(async () => {
    await Promise.resolve();
  });
  const pad = screen.getByLabelText("Drawing canvas, empty");
  const root = pad.parentElement?.parentElement as HTMLElement;
  expect(root).toBeTruthy();
  expect(root.style.flexBasis).toBe("auto");
  expect(root.style.flexShrink).toBe("0");
  expect(root.style.flexGrow).toBe("0");
});
