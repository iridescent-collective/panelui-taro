// @vitest-environment happy-dom
import { act, fireEvent, render } from "@testing-library/react";
import { expect, it, vi } from "vitest";

import { Flow } from "../src/components/Flow";
import { PanelUIProvider } from "../src/components/Provider";
import { createFlowContext } from "./helpers/flow-context";
import {
  setTestMeasurement,
  setElementCanvasNode,
  emitTestResize,
} from "./taro-api";
import { readTaroStyle } from "./taro-style";

it.each([false, true])(
  "keeps rendering surfaces stable through pan, zoom, node drag and edge animation (reduced: %s)",
  async (reduced) => {
    vi.useFakeTimers();
    try {
      setTestMeasurement(320, 375);
      const view = render(
        <PanelUIProvider reducedMotion={reduced}>
          <Flow id="pan-map">
            <Flow.Background />
            <Flow.Node id="a" position={{ x: 0, y: 0 }}>
              A
            </Flow.Node>
            <Flow.Node id="b" position={{ x: 200, y: 100 }}>
              B
            </Flow.Node>
            <Flow.Edge from="a" to="b" animated arrow />
          </Flow>
        </PanelUIProvider>
      );
      await act(async () => {
        for (let i = 0; i < 8; i += 1) await Promise.resolve();
      });
      const surface = view.container.querySelector<HTMLElement>("#pan-map")!;
      const canvas = surface.querySelector<HTMLCanvasElement>(
        "canvas.panel-flow-edges"
      )!;
      const ctx = createFlowContext();
      let allocations = 0;
      const native = {
        getContext: () => ctx,
        get width() {
          return 640;
        },
        set width(_value: number) {
          allocations += 1;
        },
        get height() {
          return 40;
        },
        set height(_value: number) {
          allocations += 1;
        },
      };
      setElementCanvasNode(canvas.id, native);
      act(() => emitTestResize());
      await act(async () => {
        for (let i = 0; i < 8; i += 1) await Promise.resolve();
      });
      expect(canvas.style.opacity).toBe("1");
      const initialAllocations = allocations;
      const images = [...surface.querySelectorAll("img")];
      expect(images).toHaveLength(1);
      const sources = images.map((image) => image.getAttribute("src"));
      const point = (clientX: number, clientY: number) => [
        { clientX, clientY, identifier: 1 },
      ];
      fireEvent.touchStart(surface, { touches: point(100, 100) });
      for (const [x, y] of [
        [120, 115],
        [170, 150],
        [230, 180],
      ]) {
        fireEvent.touchMove(surface, { touches: point(x, y) });
        expect(images.map((image) => image.getAttribute("src"))).toEqual(
          sources
        );
        expect([...surface.querySelectorAll("img")]).toEqual(images);
        expect(surface.dataset.taroCatchMove).toBe("true");
      }
      const node = surface.querySelector('[data-flow-node="a"]')!;
      const layer = node.parentElement!;
      expect(layer.contains(images[0])).toBe(true);
      expect(layer.contains(canvas)).toBe(true);
      expect(readTaroStyle(layer)).toContain("translateX(260rpx)");
      fireEvent.touchEnd(surface, {
        changedTouches: point(230, 180),
        touches: [],
      });
      expect(surface.dataset.taroCatchMove).toBe("true");
      const pinch = (distance: number) => [
        { clientX: 80, clientY: 80, identifier: 1 },
        { clientX: 80 + distance, clientY: 80, identifier: 2 },
      ];
      fireEvent.touchStart(surface, { touches: pinch(80) });
      fireEvent.touchMove(surface, { touches: pinch(160) });
      expect(images.map((image) => image.getAttribute("src"))).toEqual(sources);
      expect(readTaroStyle(layer)).toContain("scale(2)");
      fireEvent.touchEnd(surface, { touches: [], changedTouches: pinch(160) });
      const nodeCapture = node.getAttribute("data-taro-catch-move");
      expect(nodeCapture).toBe("true");
      fireEvent.touchStart(node, { touches: point(100, 100) });
      fireEvent.touchMove(node, { touches: point(160, 140) });
      expect(surface.querySelector('[data-flow-node="a"]')).toBe(node);
      expect(node.getAttribute("data-taro-catch-move")).toBe(nodeCapture);
      expect(images[0].getAttribute("src")).toBe(sources[0]);
      expect(surface.querySelector("canvas.panel-flow-edges")).toBe(canvas);
      const draws = ctx.stroke.mock.calls.length;
      act(() => vi.advanceTimersByTime(160));
      if (!reduced) expect(ctx.stroke.mock.calls.length).toBeGreaterThan(draws);
      expect([...surface.querySelectorAll("img")]).toEqual(images);
      expect(allocations).toBe(initialAllocations);
      fireEvent.touchEnd(node, {
        touches: [],
        changedTouches: point(160, 140),
      });
    } finally {
      vi.useRealTimers();
    }
  }
);
