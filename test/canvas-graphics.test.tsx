// @vitest-environment happy-dom
import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import {
  CanvasGraphics,
  paintGraphics,
} from "../src/primitives/canvas-graphics";
import {
  pathBounds,
  pathCommands,
  tracePath,
} from "../src/primitives/canvas-path";
import {
  Circle,
  ClipPath,
  Defs,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Pattern,
} from "../src/primitives/static-svg";
import { useCanvasSurface } from "../src/primitives/use-canvas-surface";
import { emitAppHide, emitAppShow, setElementCanvasNode } from "./taro-api";

afterEach(() => vi.useRealTimers());

const context = () =>
  new Proxy(
    { globalAlpha: 1, fillStyle: "#000", strokeStyle: "#000", lineWidth: 1 },
    {
      get(target, name) {
        if (!(name in target))
          Reflect.set(
            target,
            name,
            vi.fn(
              name === "createLinearGradient"
                ? () => ({ addColorStop: vi.fn() })
                : undefined
            )
          );
        return Reflect.get(target, name);
      },
    }
  ) as unknown as CanvasRenderingContext2D;

it("paints paths, inherited alpha, clipping and gradients directly on the context", () => {
  const ctx = context();
  paintGraphics(
    ctx,
    <>
      <Defs>
        <LinearGradient id="ink" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor="#fff" />
          <Stop offset="100%" stopColor="#000" />
        </LinearGradient>
      </Defs>
      <G opacity={0.5}>
        <Path d="M0 0L20 0L20 10Z" fill="url(#ink)" />
        <Circle cx={4} cy={5} r={2} fill="#f00" />
      </G>
    </>
  );
  expect(ctx.moveTo).toHaveBeenCalledWith(0, 0);
  expect(ctx.lineTo).toHaveBeenCalledWith(20, 10);
  expect(ctx.createLinearGradient).toHaveBeenCalled();
  expect(ctx.arc).toHaveBeenCalledWith(4, 5, 2, 0, Math.PI * 2);
  expect(ctx.fill).toHaveBeenCalled();
});

it("maps diagonal bounding-box gradients using the inverse transpose", () => {
  const ctx = context();
  paintGraphics(
    ctx,
    <>
      <Defs>
        <LinearGradient id="diagonal" x2="1" y2="1">
          <Stop offset="0" stopColor="hsl(120,100%,50%)" stopOpacity={0.5} />
          <Stop offset="1" stopColor="#00f8" />
        </LinearGradient>
      </Defs>
      <Rect x={10} y={10} width={100} height={50} fill="url(#diagonal)" />
    </>
  );
  expect(ctx.createLinearGradient).toHaveBeenCalledWith(10, 10, 50, 90);
});

it("keeps a transformed clipping path attached to its target", () => {
  const ctx = context();
  paintGraphics(
    ctx,
    <>
      <Defs>
        <ClipPath id="clip">
          <Rect width={10} height={10} transform="translate(20 0)" />
        </ClipPath>
      </Defs>
      <Rect width={50} height={50} clipPath="url(#clip)" />
    </>
  );
  expect(ctx.transform).toHaveBeenCalledWith(1, 0, 0, 1, 20, 0);
  expect(ctx.clip).toHaveBeenCalledWith("nonzero");
});

it("composites an overlapping translucent group once", () => {
  const ctx = context(),
    layer = context();
  const bitmap = { width: 100, height: 50, getContext: () => layer };
  paintGraphics(
    ctx,
    <G opacity={0.5}>
      <Rect width={30} height={30} />
      <Rect x={10} width={30} height={30} />
    </G>,
    { width: 100, height: 50, target: () => bitmap }
  );
  expect(layer.fill).toHaveBeenCalledTimes(2);
  expect(ctx.drawImage).toHaveBeenCalledTimes(1);
  expect(ctx.drawImage).toHaveBeenCalledWith(bitmap, 0, 0);
});

it("uses a numeric pattern matrix without a browser DOMMatrix dependency", () => {
  const ctx = context(),
    layer = context(),
    setTransform = vi.fn();
  vi.mocked(ctx.createPattern).mockReturnValue({
    setTransform,
  } as unknown as CanvasPattern);
  paintGraphics(
    ctx,
    <>
      <Defs>
        <Pattern
          id="tile"
          x={3}
          y={4}
          width={10}
          height={8}
          patternUnits="userSpaceOnUse"
        >
          <Rect x={3} y={4} width={5} height={4} />
        </Pattern>
      </Defs>
      <Rect width={100} height={50} fill="url(#tile)" />
    </>,
    {
      width: 100,
      height: 50,
      target: (_key, width, height) => ({
        width,
        height,
        getContext: () => layer,
      }),
    }
  );
  expect(setTransform).toHaveBeenCalledWith({
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 3,
    f: 4,
  });
  expect(layer.translate).not.toHaveBeenCalledWith(-3, -4);
});

it("preserves relative, reflected and elliptical arc geometry", () => {
  const ctx = context();
  tracePath(
    ctx,
    "M10 10h20v10q10 20 20 0t20 0c1 2 3 4 5 6s3 4 5 6a20 10 30 1 0 30 10z"
  );
  expect(ctx.lineTo).toHaveBeenCalledWith(30, 10);
  expect(ctx.quadraticCurveTo).toHaveBeenCalledWith(60, 0, 70, 20);
  expect(ctx.bezierCurveTo).toHaveBeenCalled();
  expect(ctx.closePath).toHaveBeenCalled();
  expect(pathBounds("M0 0Q50 100 100 0").height).toBeCloseTo(50);
  expect(() => pathCommands("M0 0L1")).toThrow();
  expect(() => pathCommands("M0 0X1 2")).toThrow();
});

it("retries a late native host and schedules only one continuous frame", async () => {
  vi.useFakeTimers();
  const ctx = context();
  const frames = new Map<number, (time: number) => void>();
  let sequence = 0;
  const node = {
    width: 0,
    height: 0,
    getContext: () => ctx,
    requestAnimationFrame: (draw: (time: number) => void) => {
      frames.set(++sequence, draw);
      return sequence;
    },
    cancelAnimationFrame: (id: number) => {
      frames.delete(id);
    },
  };
  const paint = vi.fn(() => true);
  const Probe = ({ width = 100 }: { width?: number }) => {
    useCanvasSurface("late-graphics", width, 50, paint);
    return <canvas id="late-graphics" />;
  };
  const view = render(<Probe />);
  await act(async () => {
    await Promise.resolve();
  });
  expect(paint).not.toHaveBeenCalled();
  setElementCanvasNode("late-graphics", node);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(16);
  });
  expect(paint).toHaveBeenCalledTimes(1);
  expect(frames.size).toBe(1);
  view.rerender(<Probe />);
  expect(frames.size).toBe(1);
  const [id, draw] = [...frames][0];
  frames.delete(id);
  act(() => draw(100));
  expect(frames.size).toBe(1);
  act(emitAppHide);
  expect(frames.size).toBe(0);
  act(emitAppShow);
  await act(async () => {
    await Promise.resolve();
  });
  expect(frames.size).toBe(1);
  view.unmount();
  expect(frames.size).toBe(0);
  expect(vi.getTimerCount()).toBe(0);
});

it("binds when an initially unmeasured surface becomes drawable", async () => {
  const ctx = context(),
    paint = vi.fn();
  setElementCanvasNode("measuring-graphics", {
    width: 0,
    height: 0,
    getContext: () => ctx,
  });
  const Probe = ({ width }: { width: number }) => {
    useCanvasSurface("measuring-graphics", width, 50, paint);
    return <canvas id="measuring-graphics" />;
  };
  const view = render(<Probe width={0} />);
  await act(async () => {
    await Promise.resolve();
  });
  expect(paint).not.toHaveBeenCalled();
  view.rerender(<Probe width={100} />);
  await act(async () => {
    await Promise.resolve();
  });
  expect(paint).toHaveBeenCalledOnce();
});

it("recovers a failed paint with corrected data through the bounded retry", async () => {
  vi.useFakeTimers();
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  const ctx = context(),
    paint = vi.fn<() => void>(() => {
      throw new Error("temporary paint failure");
    });
  setElementCanvasNode("recovering-graphics", {
    width: 0,
    height: 0,
    getContext: () => ctx,
  });
  let request = () => {};
  const Probe = () => {
    const surface = useCanvasSurface("recovering-graphics", 100, 50, paint);
    request = surface.requestPaint;
    return (
      <canvas
        id="recovering-graphics"
        data-unavailable={String(surface.unavailable)}
      />
    );
  };
  const view = render(<Probe />);
  await act(async () => {
    await Promise.resolve();
  });
  expect(view.container.querySelector("canvas")?.dataset.unavailable).toBe(
    "true"
  );
  paint.mockImplementation(() => {});
  act(request);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(16);
  });
  expect(view.container.querySelector("canvas")?.dataset.unavailable).toBe(
    "false"
  );
  expect(paint).toHaveBeenCalledTimes(2);
  view.unmount();
  warning.mockRestore();
});

it("does not bypass exhausted binding backoff on high-frequency input", async () => {
  vi.useFakeTimers();
  const getContext = vi.fn(() => null);
  const failed = vi.fn();
  setElementCanvasNode("absent-graphics", { width: 0, height: 0, getContext });
  let request = () => {};
  const Probe = () => {
    request = useCanvasSurface(
      "absent-graphics",
      100,
      50,
      () => {},
      failed
    ).requestPaint;
    return <canvas id="absent-graphics" />;
  };
  const view = render(<Probe />);
  await act(async () => {
    await Promise.resolve();
  });
  act(() => {
    for (let i = 0; i < 100; i++) request();
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(getContext).toHaveBeenCalledTimes(7);
  expect(failed).toHaveBeenCalledOnce();
  act(() => {
    for (let i = 0; i < 100; i++) request();
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(getContext).toHaveBeenCalledTimes(7);
  expect(failed).toHaveBeenCalledOnce();
  expect(vi.getTimerCount()).toBe(0);
  view.unmount();
});

it("retains the same canvas bitmap when graph content changes at a fixed size", async () => {
  const ctx = context();
  let widthWrites = 0;
  let heightWrites = 0;
  let width = 0;
  let height = 0;
  const node = {
    get width() {
      return width;
    },
    set width(value) {
      widthWrites++;
      width = value;
    },
    get height() {
      return height;
    },
    set height(value) {
      heightWrites++;
      height = value;
    },
    getContext: () => ctx,
  };
  const view = render(
    <CanvasGraphics width={100} height={50} viewBox="0 0 100 50">
      <Rect width={10} height={10} />
    </CanvasGraphics>
  );
  const canvas = view.container.querySelector("canvas")!;
  expect(canvas).not.toBeNull();
  expect(view.container.querySelector("img")).toBeNull();
  setElementCanvasNode(canvas.id, node);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
  const writes = [widthWrites, heightWrites];
  view.rerender(
    <CanvasGraphics width={100} height={50} viewBox="0 0 100 50">
      <Rect width={20} height={10} />
    </CanvasGraphics>
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 40));
  });
  expect(view.container.querySelector("canvas")).toBe(canvas);
  expect(width).toBe(200);
  expect(height).toBe(100);
  expect([widthWrites, heightWrites]).toEqual(writes);
  expect(ctx.clearRect).toHaveBeenCalled();
});
