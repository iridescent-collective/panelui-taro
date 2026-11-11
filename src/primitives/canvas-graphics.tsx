import { Canvas, View } from "@tarojs/components";
import { createOffscreenCanvas } from "@tarojs/taro";
import { useEffect, useId, useRef } from "react";

import { paintGraphics } from "./canvas-painter";
import type { GraphicTarget } from "./canvas-painter";
import { StaticSvg } from "./static-svg";
import type { StaticSvgProps } from "./static-svg";
import { useCanvasSurface } from "./use-canvas-surface";

export { paintGraphics } from "./canvas-painter";

/** A paused compatibility snapshot, not an SVG animation renderer. */
export const GraphicSnapshot = ({ children, ...props }: StaticSvgProps) => {
  const snapshot = useRef(children);
  return <StaticSvg {...props}>{snapshot.current}</StaticSvg>;
};

export const CanvasGraphics = ({
  width,
  height,
  viewBox,
  children,
}: StaticSvgProps) => {
  const id = `panelui-graphics-${useId().replaceAll(":", "")}`;
  const snapshot = useRef(children);
  const targets = useRef(new Map<string, GraphicTarget>());
  useEffect(() => () => targets.current.clear(), []);
  const { unavailable, occluded } = useCanvasSurface(
    id,
    width,
    height,
    (ctx, node) => {
      const [x, y, w, h] = viewBox
        .trim()
        .split(/[\s,]+/u)
        .map(Number);
      if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return;
      ctx.scale(width / w, height / h);
      ctx.translate(-x, -y);
      paintGraphics(ctx, children, {
        width: node.width,
        height: node.height,
        matrix: [
          node.width / w,
          0,
          0,
          node.height / h,
          (-x * node.width) / w,
          (-y * node.height) / h,
        ],
        viewBox: { x, y, width: w, height: h },
        target: (key, w, h) => {
          if (
            !Number.isFinite(w) ||
            !Number.isFinite(h) ||
            w > 4096 ||
            h > 4096
          )
            throw new Error("Canvas: intermediate bitmap exceeds 4096 pixels");
          let target = targets.current.get(key);
          if (!target) {
            if (targets.current.size >= 32)
              targets.current.delete(targets.current.keys().next().value!);
            target = createOffscreenCanvas({
              type: "2d",
              width: w,
              height: h,
            }) as unknown as GraphicTarget;
            targets.current.set(key, target);
          }
          if (target.width !== w) target.width = w;
          if (target.height !== h) target.height = h;
          return target;
        },
      });
      snapshot.current = children;
    }
  );
  const fallback = unavailable || occluded;
  return (
    <View
      aria-hidden
      style={{
        position: "relative",
        flexShrink: 0,
        width: `${width * 2}rpx`,
        height: `${height * 2}rpx`,
      }}
    >
      <Canvas
        id={id}
        type="2d"
        aria-hidden
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: fallback ? 0 : 1,
        }}
      />
      {fallback ? (
        <View className="absolute inset-0">
          <StaticSvg width={width} height={height} viewBox={viewBox}>
            {snapshot.current}
          </StaticSvg>
        </View>
      ) : null}
    </View>
  );
};
