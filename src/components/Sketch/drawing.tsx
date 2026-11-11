import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import EraserIcon from "@hugeicons/core-free-icons/EraserIcon";
import LineSquiggleIcon from "@hugeicons/core-free-icons/LineSquiggleIcon";
import Shapes01Icon from "@hugeicons/core-free-icons/Shapes01Icon";
import Tick02Icon from "@hugeicons/core-free-icons/Tick02Icon";
import Undo03Icon from "@hugeicons/core-free-icons/Undo03Icon";
import { Image } from "@tarojs/components";
import { useRef } from "react";

import { Drawing } from "../../icons/Drawing";
import { Circle, Path, StaticSvg } from "../../primitives/static-svg";
import { ALL_SHAPES, GLYPH_STROKE } from "./constants";
import { shapePath } from "./math";
import type { SketchShape } from "./types";

export const SKETCH_GLYPHS = {
  close: Cancel01Icon,
  done: Tick02Icon,
  eraser: EraserIcon,
  pen: LineSquiggleIcon,
  shape: Shapes01Icon,
  undo: Undo03Icon,
};
export const Glyph = ({
  name,
  color,
  size = 22,
}: {
  name: keyof typeof SKETCH_GLYPHS;
  color: string;
  size?: number;
}) => (
  <Drawing
    glyph={SKETCH_GLYPHS[name]}
    color={color}
    size={size}
    strokeWidth={GLYPH_STROKE}
  />
);
export const ShapeGlyph = ({
  shape,
  color,
  size = 24,
}: {
  shape: SketchShape;
  color: string;
  size?: number;
}) => {
  const diagonal = shape === "line" || shape === "arrow";
  const d = diagonal
    ? shapePath(ALL_SHAPES.indexOf(shape), 3, size - 3, size - 3, 3, 1.2)
    : shapePath(ALL_SHAPES.indexOf(shape), 3, 4, size - 3, size - 4, 1.2);
  return (
    <StaticSvg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={GLYPH_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </StaticSvg>
  );
};
export const CustomColorRing = ({
  color,
  size = 32,
}: {
  color: string;
  size?: number;
}) => {
  const r = size / 2 - 2;
  const c = size / 2;
  return (
    <StaticSvg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {Array.from({ length: 24 }, (_, i) => {
        const a0 = (i / 24) * Math.PI * 2 - Math.PI / 2;
        const a1 = ((i + 1.08) / 24) * Math.PI * 2 - Math.PI / 2;
        return (
          <Path
            key={i}
            d={`M${c + r * Math.cos(a0)},${c + r * Math.sin(a0)} A${r},${r} 0 0 1 ${c + r * Math.cos(a1)},${c + r * Math.sin(a1)}`}
            stroke={`hsl(${(i * 360) / 24}, 90%, 58%)`}
            strokeWidth={3.5}
            fill="none"
          />
        );
      })}
      <Circle cx={c} cy={c} r={r - 4} fill={color} />
    </StaticSvg>
  );
};
export const SketchFallback = ({
  svg,
  frozen = false,
}: {
  svg: string;
  frozen?: boolean;
}) => {
  const snapshot = useRef(svg);
  return (
    <Image
      aria-hidden
      className="absolute inset-0 h-full w-full"
      mode="scaleToFill"
      src={`data:image/svg+xml,${encodeURIComponent(frozen ? snapshot.current : svg)}`}
      style={{ pointerEvents: "none" }}
    />
  );
};
