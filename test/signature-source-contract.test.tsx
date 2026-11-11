// @vitest-environment happy-dom
import "./geometry-renderer";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { PanelUIProvider } from "../src/components/Provider";
import { Signature } from "../src/components/Signature";
import type { SignatureHandle } from "../src/components/Signature";
import { signatureFilePath } from "../src/components/Signature/files";
import { createSignatureHistory } from "../src/components/Signature/history";
import { strokePath } from "../src/components/Signature/math";
import FIXTURES from "./fixtures/signature-source.json";
import { deferred } from "./helpers/deferred";
import {
  canvasToTempFilePath,
  emitTestResize,
  setElementCanvasNode,
  testFileSystem,
  setTestMeasurement,
  showActionSheet,
} from "./taro-api";
import { dispatchTaroEvent, TARO_TEST_EVENTS } from "./taro-components";
import { readTaroStyle } from "./taro-style";

const point = (x: number, y: number) => ({ identifier: 1, x, y });
const secondPoint = (x: number, y: number) => ({ identifier: 2, x, y });
it.each([
  [[], ""],
  [[10, 20], "M10,20 l0.01,0"],
  [[10, 20, 30, 40], "M10,20 Q10,20 20,30 L30,40"],
  [[0, 0, 10, 20, 30, 0], "M0,0 Q0,0 5,10 Q10,20 20,10 L30,0"],
] as const)("matches source midpoint curve %#", (points, expected) =>
  expect(strokePath([...points])).toBe(expected)
);
it("supports repeated same-frame undo/redo and drops the redo branch on new input", () => {
  const history = createSignatureHistory();
  history.commit([0, 0]);
  history.commit([1, 1]);
  history.commit([2, 2]);
  history.undo();
  history.undo();
  expect(history.signal.value.strokes).toHaveLength(1);
  history.redo();
  history.redo();
  expect(history.signal.value.strokes).toHaveLength(3);
  history.undo();
  history.commit([8, 8]);
  history.redo();
  expect(history.signal.value.strokes.at(-1)).toEqual([8, 8]);
});
it("records a tap and smoothed stroke, filters near points, and exposes the source handle", async () => {
  setTestMeasurement(300, 375);
  const ref = createRef<SignatureHandle>();
  const change = vi.fn();
  const begin = vi.fn();
  const end = vi.fn();
  render(
    <PanelUIProvider>
      <Signature
        ref={ref}
        onChange={change}
        onBegin={begin}
        onEnd={end}
        guideline
        guidelineLabel="Name"
      />
    </PanelUIProvider>
  );
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing native pad");
  }
  fireEvent.touchStart(canvas, { touches: [point(10, 20)] });
  fireEvent.touchEnd(canvas, { changedTouches: [point(10, 20)] });
  expect(ref.current?.strokeCount()).toBe(1);
  expect(begin).toHaveBeenCalledOnce();
  expect(end).toHaveBeenCalledOnce();
  expect(change).toHaveBeenLastCalledWith(1);
  expect(ref.current?.toSVG()).toContain("M10,20 l0.01,0");
  fireEvent.touchStart(canvas, { touches: [point(20, 30)] });
  fireEvent.touchMove(canvas, { touches: [point(20.2, 30.2)] });
  fireEvent.touchMove(canvas, { touches: [point(40, 50)] });
  fireEvent.touchEnd(canvas, { changedTouches: [point(40, 50)] });
  expect(ref.current?.toSVG()).toContain("M20,30 Q20,30 30,40 L40,50");
  expect(ref.current?.toSVG()).not.toContain("20.2");
  act(() => ref.current?.undo());
  expect(ref.current?.strokeCount()).toBe(1);
  act(() => ref.current?.redo());
  expect(ref.current?.strokeCount()).toBe(2);
  expect(await ref.current?.toDataURL()).toMatch(
    /^data:image\/svg\+xml;utf8,/u
  );
  act(() => ref.current?.clear());
  expect(ref.current?.isEmpty()).toBe(true);
  expect(screen.getByText("Sign here")).toBeTruthy();
});
it("retains existing ink when disabled and exposes an alternative without requiring drawing", () => {
  const ref = createRef<SignatureHandle>();
  const alternative = vi.fn();
  const view = render(
    <PanelUIProvider>
      <Signature ref={ref} onRequestAlternative={alternative} />
    </PanelUIProvider>
  );
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing native pad");
  }
  fireEvent.touchStart(canvas, { touches: [point(10, 20)] });
  fireEvent.touchEnd(canvas, { changedTouches: [point(10, 20)] });
  view.rerender(
    <PanelUIProvider>
      <Signature ref={ref} disabled onRequestAlternative={alternative} />
    </PanelUIProvider>
  );
  fireEvent.touchStart(canvas, { touches: [point(30, 40)] });
  fireEvent.touchEnd(canvas, { changedTouches: [point(30, 40)] });
  expect(ref.current?.strokeCount()).toBe(1);
  expect(
    screen.queryByRole("button", { name: "Use another signature method" })
  ).toBeNull();
  view.rerender(
    <PanelUIProvider>
      <Signature ref={ref} onRequestAlternative={alternative} />
    </PanelUIProvider>
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Use another signature method" })
  );
  expect(alternative).toHaveBeenCalledOnce();
});

const settle = () =>
  act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
const nativeCanvas = () => {
  const context = {
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    lineCap: "round",
    lineJoin: "round",
    lineTo: vi.fn(),
    lineWidth: 0,
    moveTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    scale: vi.fn(),
    stroke: vi.fn(),
    strokeStyle: "",
  };
  return { context, node: { getContext: () => context, height: 0, width: 0 } };
};
it("uses native PNG raster and app-local files while preserving the source export handle", async () => {
  setTestMeasurement(300, 375);
  const ref = createRef<SignatureHandle>();
  render(
    <PanelUIProvider>
      <Signature ref={ref} />
    </PanelUIProvider>
  );
  await settle();
  const canvases = document.querySelectorAll("canvas");
  const [live, exported] = canvases;
  if (!live || !exported) {
    throw new Error("Missing native export surfaces");
  }
  const ink = nativeCanvas();
  const output = nativeCanvas();
  setElementCanvasNode(live.id, ink.node);
  setElementCanvasNode(exported.id, output.node);
  act(() => emitTestResize());
  await settle();
  fireEvent.touchStart(live, { touches: [point(10, 20)] });
  fireEvent.touchMove(live, { touches: [point(30, 40)] });
  fireEvent.touchEnd(live, { changedTouches: [point(30, 40)] });
  const svg = await ref.current?.save({ filename: "demo" });
  expect(svg).toMatchObject({
    format: "svg",
    uri: "wxfile://test-user/demo.svg",
  });
  expect(testFileSystem.writeFile).toHaveBeenLastCalledWith(
    expect.objectContaining({
      data: expect.stringContaining(" Q10,20 20,30"),
      encoding: "utf-8",
    })
  );
  expect(await ref.current?.toDataURL("png")).toBe(
    "data:image/png;base64,dGVzdA=="
  );
  expect(output.context.quadraticCurveTo).toHaveBeenCalledWith(10, 20, 20, 30);
  expect(canvasToTempFilePath).toHaveBeenCalledWith(
    expect.objectContaining({ destWidth: 600, fileType: "png" }),
    expect.anything()
  );
  const png = await ref.current?.save({
    filename: "demo",
    format: "png",
    scale: 3,
  });
  expect(png).toMatchObject({
    format: "png",
    uri: "wxfile://test-user/demo.png",
  });
  expect(testFileSystem.copyFile).toHaveBeenLastCalledWith(
    expect.objectContaining({
      destPath: "wxfile://test-user/demo.png",
      srcPath: "wxfile://signature-temp.png",
    })
  );
  act(() => ref.current?.clear());
  expect(ref.current?.strokeCount()).toBe(0);
  expect(screen.queryByText("Sign here")).toBeTruthy();
  expect(output.context.stroke).toHaveBeenCalled();
  expect(output.node.width).toBe(900);
  const exportStyle = JSON.parse(readTaroStyle(exported) ?? "{}");
  const left =
    typeof exportStyle.left === "string"
      ? Number(exportStyle.left.replace(/px$/u, ""))
      : 0;
  const top =
    typeof exportStyle.top === "string"
      ? Number(exportStyle.top.replace(/px$/u, ""))
      : 0;
  expect(
    left + 300 <= 0 || top + 20 <= 0,
    "An exported native bitmap must stay outside the visible signature pad after Clear"
  ).toBe(true);
  await expect(
    ref.current?.save({ format: "png", scale: Infinity })
  ).rejects.toThrow("scale");
});
it.each(["../outside", "a/b", "a\\b", "\u0000bad", ".", ".."])(
  "rejects export file name %j",
  (filename) =>
    expect(() => signatureFilePath({ filename })).toThrow("filename")
);
it.each([
  "wxfile://other",
  "wxfile://test-user/../outside",
  "wxfile://test-user-evil",
])("rejects export directory %s", (directory) =>
  expect(() => signatureFilePath({ directory })).toThrow()
);
it("escapes ink text in SVG so a caller colour cannot create markup", () => {
  const ref = createRef<SignatureHandle>();
  render(
    <PanelUIProvider>
      <Signature ref={ref} strokeColor={'red"/><script>x</script>'} />
    </PanelUIProvider>
  );
  const pad = document.querySelector("canvas");
  if (!pad) {
    throw new Error("Missing pad");
  }
  fireEvent.touchStart(pad, { touches: [point(1, 2)] });
  fireEvent.touchEnd(pad, { changedTouches: [point(1, 2)] });
  expect(ref.current?.toSVG()).not.toContain("<script>");
  expect(ref.current?.toSVG()).toContain("&lt;script&gt;");
});

const exportPad = async () => {
  setTestMeasurement(300, 375);
  const ref = createRef<SignatureHandle>();
  const view = render(
    <PanelUIProvider>
      <Signature ref={ref} onRequestAlternative={() => {}} />
    </PanelUIProvider>
  );
  await settle();
  const [live, exported] = document.querySelectorAll("canvas");
  if (!live || !exported) {
    throw new Error("Missing export pad");
  }
  const output = nativeCanvas();
  setElementCanvasNode(exported.id, output.node);
  return { live, output, ref, view };
};
it("exports the same committed snapshot after a same-frame undo", async () => {
  const { live, output, ref } = await exportPad();
  for (const x of [10, 20]) {
    fireEvent.touchStart(live, { touches: [point(x, 30)] });
    fireEvent.touchEnd(live, { changedTouches: [point(x, 30)] });
  }
  let pending: Promise<string> = Promise.resolve("");
  act(() => {
    ref.current?.undo();
    pending = ref.current?.toDataURL("png") ?? Promise.resolve("");
    expect(ref.current?.toSVG().match(/<path /gu)).toHaveLength(1);
  });
  await pending;
  expect(output.context.stroke).toHaveBeenCalledTimes(1);
});
it("serializes native captures so a second export cannot resize the first canvas", async () => {
  const { ref } = await exportPad();
  const held = deferred<boolean>();
  const widths: number[] = [];
  canvasToTempFilePath.mockImplementationOnce(async (options) => {
    await held.promise;
    widths.push((options as { canvas: { width: number } }).canvas.width);
    return { tempFilePath: "wxfile://first.png" };
  });
  const first = ref.current?.save({ format: "png", scale: 1 });
  await settle();
  const second = ref.current?.save({ format: "png", scale: 2 });
  await settle();
  held.resolve(true);
  await first;
  await second;
  expect(widths).toEqual([300]);
});
it("ignores an editing menu reply after unmount", async () => {
  const menu = deferred<{ errMsg: string; tapIndex: number }>();
  showActionSheet.mockReturnValueOnce(menu.promise);
  const alternative = vi.fn();
  const view = render(
    <PanelUIProvider>
      <Signature onRequestAlternative={alternative} />
    </PanelUIProvider>
  );
  const pad = screen.getByRole("img", { name: "Signature pad" });
  act(() => dispatchTaroEvent(pad, TARO_TEST_EVENTS.longPress, {}));
  view.unmount();
  await act(async () => {
    menu.resolve({ errMsg: "showActionSheet:ok", tapIndex: 0 });
    await menu.promise;
  });
  expect(alternative).not.toHaveBeenCalled();
});

it.each(FIXTURES.paths)(
  "matches fixed source stroke path %#",
  ({ input, expected }) => expect(strokePath(input)).toBe(expected)
);

it("keeps one averaged stroke when a second finger joins and the first finger lifts", () => {
  setTestMeasurement(300, 375);
  const ref = createRef<SignatureHandle>();
  const begin = vi.fn();
  const end = vi.fn();
  render(<Signature ref={ref} onBegin={begin} onEnd={end} />);
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing signature canvas");
  }
  fireEvent.touchStart(canvas, { touches: [point(10, 20)] });
  fireEvent.touchStart(canvas, {
    touches: [point(10, 20), secondPoint(30, 40)],
  });
  expect(ref.current?.strokeCount()).toBe(0);
  expect(begin).toHaveBeenCalledOnce();
  fireEvent.touchMove(canvas, {
    touches: [point(20, 30), secondPoint(40, 50)],
  });
  fireEvent.touchEnd(canvas, {
    changedTouches: [point(20, 30)],
    touches: [secondPoint(40, 50)],
  });
  expect(ref.current?.strokeCount()).toBe(0);
  expect(end).not.toHaveBeenCalled();
  fireEvent.touchMove(canvas, { touches: [secondPoint(40, 50)] });
  fireEvent.touchEnd(canvas, {
    changedTouches: [secondPoint(40, 50)],
    touches: [],
  });
  expect(ref.current?.strokeCount()).toBe(1);
  expect(end).toHaveBeenCalledOnce();
  expect(ref.current?.toSVG()).toContain(strokePath([10, 20, 30, 40, 40, 50]));
});

it("averages a multi-touch start, commits cancellation once, and accepts the next single-finger stroke", () => {
  setTestMeasurement(300, 375);
  const ref = createRef<SignatureHandle>();
  const end = vi.fn();
  render(<Signature ref={ref} onEnd={end} />);
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing signature canvas");
  }
  const first = [point(10, 20), { identifier: 2, x: 30, y: 40 }];
  const moved = [point(30, 40), { identifier: 2, x: 50, y: 60 }];
  fireEvent.touchStart(canvas, { touches: first });
  fireEvent.touchMove(canvas, { touches: moved });
  fireEvent.touchCancel(canvas, { touches: moved });
  fireEvent.touchEnd(canvas, { touches: [] });
  expect(ref.current?.strokeCount()).toBe(1);
  expect(end).toHaveBeenCalledOnce();
  expect(ref.current?.toSVG()).toContain(strokePath([20, 30, 40, 50]));
  fireEvent.touchStart(canvas, { touches: [point(60, 70)] });
  fireEvent.touchEnd(canvas, { touches: [] });
  expect(ref.current?.strokeCount()).toBe(2);
  expect(ref.current?.toSVG()).toContain("M60,70 l0.01,0");
});

it("ignores disabled multi-touch input and finalizes one active averaged stroke when disabled", () => {
  const ref = createRef<SignatureHandle>();
  const begin = vi.fn();
  const end = vi.fn();
  const view = render(
    <Signature ref={ref} disabled onBegin={begin} onEnd={end} />
  );
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing signature canvas");
  }
  const touches = [point(10, 20), { identifier: 2, x: 30, y: 40 }];
  fireEvent.touchStart(canvas, { touches });
  fireEvent.touchMove(canvas, { touches });
  fireEvent.touchEnd(canvas, { touches: [] });
  expect(begin).not.toHaveBeenCalled();
  expect(ref.current?.strokeCount()).toBe(0);
  view.rerender(<Signature ref={ref} onBegin={begin} onEnd={end} />);
  fireEvent.touchStart(canvas, { touches });
  view.rerender(<Signature ref={ref} disabled onBegin={begin} onEnd={end} />);
  fireEvent.touchMove(canvas, { touches });
  fireEvent.touchEnd(canvas, { touches: [] });
  expect(ref.current?.strokeCount()).toBe(1);
  expect(begin).toHaveBeenCalledOnce();
  expect(end).toHaveBeenCalledOnce();
});

it("clears an active gesture immediately and prevents its later move or end from restoring ink", () => {
  const ref = createRef<SignatureHandle>();
  render(<Signature ref={ref} />);
  const canvas = document.querySelector("canvas");
  if (!canvas) {
    throw new Error("Missing signature canvas");
  }
  fireEvent.touchStart(canvas, { touches: [point(10, 20)] });
  fireEvent.touchMove(canvas, { touches: [point(30, 40)] });
  act(() => ref.current?.clear());
  expect(screen.queryByText("Sign here")).toBeTruthy();
  fireEvent.touchMove(canvas, { touches: [point(50, 60)] });
  fireEvent.touchEnd(canvas, { touches: [] });
  expect(ref.current?.strokeCount()).toBe(0);
  expect(ref.current?.toSVG()).not.toContain("<path");
});
