import {
  canvasToTempFilePath,
  createSelectorQuery,
  getCurrentInstance,
} from "@tarojs/taro";
import { useRef, useState } from "react";

import { weappNodeSelector } from "../../platform/node-selector";
import { useCanvasSurface } from "../../primitives/use-canvas-surface";
import { paintSignatureStroke, readSignatureCanvas } from "./canvas";

interface InkFrame {
  width: number;
  height: number;
  ink: string;
  strokeWidth: number;
  live: number[];
  strokes: number[][];
}
export const useSignatureCanvas = (
  id: string,
  exportId: string,
  frame: InkFrame
) => {
  const latest = useRef(frame);
  latest.current = frame;
  const [scope] = useState(() => getCurrentInstance().page);
  const surface = useCanvasSurface(id, frame.width, frame.height, (context) => {
    const settings = latest.current;
    context.lineWidth = settings.strokeWidth;
    context.strokeStyle = settings.ink;
    context.lineCap = "round";
    context.lineJoin = "round";
    for (const points of settings.strokes)
      paintSignatureStroke(context, points);
    paintSignatureStroke(context, settings.live);
  });
  const fallback = surface.unavailable || surface.occluded;
  const exportQueue = useRef(Promise.resolve(true));
  const capture = async (settings: InkFrame, scale: number) => {
    if (!Number.isFinite(scale) || scale <= 0 || scale > 8) {
      throw new Error(
        "Signature: scale must be greater than zero and at most 8"
      );
    }
    if (
      settings.width <= 0 ||
      settings.height <= 0 ||
      settings.width * scale > 8192 ||
      settings.height * scale > 8192
    ) {
      throw new Error(
        "Signature: pad is unmeasured or export size exceeds 8192 pixels"
      );
    }
    const value = await new Promise<
      NonNullable<ReturnType<typeof readSignatureCanvas>>
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
              ? readSignatureCanvas(result.node)
              : null;
          if (target) {
            resolve(target);
          } else {
            reject(new Error("Signature: native Canvas 2D is unavailable"));
          }
        })
        .exec();
    });
    value.canvas.width = Math.max(1, Math.round(settings.width * scale));
    value.canvas.height = Math.max(1, Math.round(settings.height * scale));
    value.context.scale(scale, scale);
    value.context.lineWidth = settings.strokeWidth;
    value.context.strokeStyle = settings.ink;
    value.context.lineCap = "round";
    value.context.lineJoin = "round";
    for (const points of settings.strokes) {
      paintSignatureStroke(value.context, points);
    }
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
  const rasterise = (scale: number, strokes?: number[][]) => {
    const settings = {
      ...latest.current,
      strokes: (strokes ?? latest.current.strokes).map((points) => [...points]),
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
    draw: (points?: number[], strokes?: number[][]) => {
      if (points) {
        latest.current.live = points;
      }
      if (strokes) latest.current.strokes = strokes;
      surface.requestPaint();
    },
    fallback,
    rasterise,
  };
};
