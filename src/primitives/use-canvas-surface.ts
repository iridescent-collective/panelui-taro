import {
  createSelectorQuery,
  getCurrentInstance,
  getWindowInfo,
  nextTick,
  offAppHide,
  offAppShow,
  onAppHide,
  onAppShow,
  onWindowResize,
  offWindowResize,
} from "@tarojs/taro";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { weappNodeSelector } from "../platform/node-selector";
import { useCanvasPaintOccluded } from "./canvas-paint-context";

export interface CanvasSurfaceNode {
  width: number;
  height: number;
  getContext: (type: "2d") => CanvasRenderingContext2D;
  requestAnimationFrame?: (callback: (time: number) => void) => number;
  cancelAnimationFrame?: (id: number) => void;
}

/** Own one bitmap for the mounted host; content updates only schedule a paint. */
export const useCanvasSurface = (
  id: string,
  width: number,
  height: number,
  paint: (
    ctx: CanvasRenderingContext2D,
    node: CanvasSurfaceNode,
    time: number
  ) => boolean | void,
  onError?: (error: unknown) => void
) => {
  const occluded = useCanvasPaintOccluded();
  const latest = useRef({ width, height, paint, onError });
  latest.current = { width, height, paint, onError };
  const [scope] = useState(() => getCurrentInstance().page);
  const [unavailable, setUnavailable] = useState(false);
  const binding = useRef<{
    node: CanvasSurfaceNode;
    ctx: CanvasRenderingContext2D;
  } | null>(null);
  const ensure = useRef(() => {});
  const measure = useRef(() => {});
  useLayoutEffect(() => {
    let disposed = false,
      hidden = false,
      failed = false,
      attempts = 0,
      reported = false,
      bindingPending = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let pending: { cancel: () => void } | null = null;
    const cancel = () => {
      pending?.cancel();
      pending = null;
    };
    const retryBinding = (
      error: unknown = new Error("Native Canvas 2D is unavailable")
    ) => {
      if (attempts >= 6) {
        if (!reported) {
          reported = true;
          latest.current.onError?.(error);
        }
        return;
      }
      if (
        retry !== undefined ||
        bindingPending ||
        attempts >= 6 ||
        disposed ||
        hidden ||
        occluded ||
        latest.current.width <= 0 ||
        latest.current.height <= 0
      )
        return;
      attempts += 1;
      retry = setTimeout(
        () => {
          retry = undefined;
          bind();
        },
        16 * 2 ** (attempts - 1)
      );
    };
    const draw = (time = Date.now()) => {
      pending = null;
      const value = binding.current,
        settings = latest.current;
      if (
        disposed ||
        hidden ||
        occluded ||
        !value ||
        settings.width <= 0 ||
        settings.height <= 0
      )
        return;
      const win = getWindowInfo();
      const ratio = Math.min(
        (win.windowWidth / 375) * win.pixelRatio,
        4096 / settings.width,
        4096 / settings.height
      );
      const w = Math.max(1, Math.round(settings.width * ratio)),
        h = Math.max(1, Math.round(settings.height * ratio));
      if (value.node.width !== w) value.node.width = w;
      if (value.node.height !== h) value.node.height = h;
      const ctx = value.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      try {
        ctx.scale(w / settings.width, h / settings.height);
        const repeat = settings.paint(ctx, value.node, time);
        failed = false;
        attempts = 0;
        reported = false;
        setUnavailable(false);
        if (repeat) request();
      } catch (error) {
        failed = true;
        setUnavailable(true);
        if (attempts === 0)
          console.warn("PanelUI Canvas drawing paused:", error);
        retryBinding(error);
      } finally {
        ctx.restore();
      }
    };
    const request = () => {
      if (
        pending ||
        disposed ||
        hidden ||
        failed ||
        occluded ||
        !binding.current
      )
        return;
      const { node } = binding.current;
      if (node.requestAnimationFrame && node.cancelAnimationFrame) {
        const frame = node.requestAnimationFrame(draw);
        pending = { cancel: () => node.cancelAnimationFrame?.(frame) };
      } else {
        const timer = setTimeout(draw, 16);
        pending = { cancel: () => clearTimeout(timer) };
      }
    };
    const bind = () => {
      if (
        bindingPending ||
        disposed ||
        hidden ||
        occluded ||
        latest.current.width <= 0 ||
        latest.current.height <= 0
      )
        return;
      bindingPending = true;
      nextTick(() => {
        if (disposed) return;
        const query = createSelectorQuery();
        if (scope) query.in(scope);
        query
          .select(weappNodeSelector(id))
          .fields({ node: true, size: true }, (result) => {
            bindingPending = false;
            if (disposed) return;
            const node =
              result && !Array.isArray(result)
                ? (result.node as CanvasSurfaceNode | undefined)
                : undefined;
            let ctx: CanvasRenderingContext2D | undefined;
            try {
              ctx = node?.getContext?.("2d");
            } catch {
              /* Snapshot remains available when the host has no Canvas 2D. */
            }
            if (!node || !ctx || typeof ctx.setTransform !== "function") {
              failed = true;
              cancel();
              setUnavailable(true);
              retryBinding();
              return;
            }
            binding.current = { node, ctx };
            cancel();
            draw();
          })
          .exec();
      });
    };
    const resize = () => {
      if (bindingPending) return;
      clearTimeout(retry);
      retry = undefined;
      attempts = 0;
      failed = false;
      bind();
    };
    const update = () => {
      if (binding.current && !failed) request();
      else retryBinding();
    };
    ensure.current = update;
    measure.current = resize;
    const hide = () => {
      hidden = true;
      cancel();
      clearTimeout(retry);
      retry = undefined;
    };
    const show = () => {
      hidden = false;
      resize();
    };
    bind();
    onWindowResize(resize);
    onAppHide(hide);
    onAppShow(show);
    return () => {
      disposed = true;
      cancel();
      clearTimeout(retry);
      ensure.current = () => {};
      measure.current = () => {};
      const value = binding.current;
      if (value) {
        value.ctx.setTransform(1, 0, 0, 1, 0, 0);
        value.ctx.clearRect(0, 0, value.node.width, value.node.height);
      }
      binding.current = null;
      offWindowResize(resize);
      offAppHide(hide);
      offAppShow(show);
    };
  }, [id, scope, occluded]);
  useEffect(() => {
    measure.current();
  }, [width, height]);
  useEffect(() => {
    ensure.current();
  });
  return {
    unavailable,
    occluded,
    requestPaint: () => ensure.current(),
  };
};
