import {
  canvasToTempFilePath,
  createSelectorQuery,
  getCurrentInstance,
} from "@tarojs/taro";
import { useRef, useState } from "react";

import { weappNodeSelector } from "../../platform/node-selector";
import { useCanvasSurface } from "../../primitives/use-canvas-surface";
import { paintSketchItems, readSketchCanvas } from "./canvas";
import type { SketchInkContext } from "./canvas";
import type { SketchItem } from "./types";

export interface InkFrame {
  width: number;
  height: number;
  items: SketchItem[];
  live: SketchItem | null;
  surface: string;
}
const paintVisibleInk = (context: SketchInkContext, settings: InkFrame) => {
  paintSketchItems(context, settings.items);
  if (!settings.live) {
    return;
  }
  const live =
    settings.live.type === "erase"
      ? {
          color: settings.surface,
          d: settings.live.d,
          type: "stroke" as const,
          width: settings.live.width,
        }
      : settings.live;
  paintSketchItems(context, [live]);
};
export const useSketchCanvas = (
  id: string,
  exportId: string,
  frame: InkFrame
) => {
  const latest = useRef(frame);
  latest.current = frame;
  const [scope] = useState(() => getCurrentInstance().page);
  const surface = useCanvasSurface(id, frame.width, frame.height, (context) => {
    const settings = latest.current;
    paintVisibleInk(context, settings);
  });
  const fallback = surface.unavailable || surface.occluded;
  const exportQueue = useRef(Promise.resolve(true));
  const capture = async (settings: InkFrame, scale: number) => {
    if (!Number.isFinite(scale) || scale <= 0 || scale > 8) {
      throw new Error("Sketch: scale must be greater than zero and at most 8");
    }
    if (
      settings.width <= 0 ||
      settings.height <= 0 ||
      settings.width * scale > 8192 ||
      settings.height * scale > 8192
    ) {
      throw new Error(
        "Sketch: pad is unmeasured or export size exceeds 8192 pixels"
      );
    }
    const value = await new globalThis.Promise<
      NonNullable<ReturnType<typeof readSketchCanvas>>
    >((resolve, reject) => {
      const query = createSelectorQuery();
      if (scope) {
        query.in(scope);
      }
      query
        .select(weappNodeSelector(exportId))
        .fields({ node: true, size: true }, (result) => {
          const target =
            result && !Array.isArray(result)
              ? readSketchCanvas(result.node)
              : null;
          if (target) {
            resolve(target);
          } else {
            reject(new Error("Sketch: native Canvas 2D is unavailable"));
          }
        })
        .exec();
    });
    value.canvas.width = Math.max(1, Math.round(settings.width * scale));
    value.canvas.height = Math.max(1, Math.round(settings.height * scale));
    value.context.scale(scale, scale);
    paintVisibleInk(value.context, settings);
    const result = await canvasToTempFilePath(
      {
        canvas: value.canvas,
        destHeight: value.canvas.height,
        destWidth: value.canvas.width,
        fileType: "png",
      },
      scope ?? undefined
    );
    return result.tempFilePath;
  };
  const rasterise = (scale: number, snapshot?: InkFrame) => {
    const current = snapshot ?? latest.current;
    const settings = {
      ...current,
      items: current.items.map((item) => ({ ...item })),
      live: current.live ? { ...current.live } : null,
    };
    const previous = exportQueue.current;
    const pending = (async () => {
      await previous;
      return capture(settings, scale);
    })();
    exportQueue.current = (async () => {
      try {
        await pending;
        return true;
      } catch {
        return false;
      }
    })();
    return pending;
  };
  return {
    draw: (next?: InkFrame) => {
      if (next) {
        latest.current = next;
      }
      surface.requestPaint();
    },
    fallback,
    rasterise,
  };
};
