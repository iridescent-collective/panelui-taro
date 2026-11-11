import { Children, Fragment, isValidElement } from "react";
import type { ReactNode } from "react";

import { hsvToCss, parseColor } from "../lib/color";
import { pathBounds, tracePath } from "./canvas-path";

type Props = Record<string, unknown> & { children?: ReactNode };
type Bounds = { x: number; y: number; width: number; height: number };
type Matrix = [number, number, number, number, number, number];
const identity: Matrix = [1, 0, 0, 1, 0, 0];
const multiply = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[2] * b[1],
  a[1] * b[0] + a[3] * b[1],
  a[0] * b[2] + a[2] * b[3],
  a[1] * b[2] + a[3] * b[3],
  a[0] * b[4] + a[2] * b[5] + a[4],
  a[1] * b[4] + a[3] * b[5] + a[5],
];
export interface GraphicTarget {
  width: number;
  height: number;
  getContext: (type: "2d") => CanvasRenderingContext2D;
}
export interface GraphicPaintOptions {
  width: number;
  height: number;
  matrix?: Matrix;
  viewBox?: Bounds;
  target: (key: string, width: number, height: number) => GraphicTarget;
}
const number = (value: unknown, fallback = 0) =>
  value === undefined ? fallback : Number(value);
const list = (value: unknown) =>
  String(value ?? "")
    .trim()
    .split(/[\s,]+/u)
    .filter(Boolean)
    .map(Number);
const refId = (value: unknown) => /^url\(#([^)]*)\)$/u.exec(String(value))?.[1];
const element = (node: ReactNode) =>
  isValidElement<Props>(node) ? node : null;

const transformMatrix = (value: unknown) => {
  let result = identity;
  for (const match of String(value ?? "").matchAll(
    /([a-zA-Z]+)\(([^)]*)\)/gu
  )) {
    const v = list(match[2]);
    if (v.some((item) => !Number.isFinite(item)))
      throw new Error("Canvas: invalid transform");
    let next: Matrix;
    if (match[1] === "translate") next = [1, 0, 0, 1, v[0], v[1] ?? 0];
    else if (match[1] === "scale") next = [v[0], 0, 0, v[1] ?? v[0], 0, 0];
    else if (match[1] === "rotate") {
      const a = (v[0] * Math.PI) / 180,
        x = v[1] ?? 0,
        y = v[2] ?? 0;
      next = multiply(
        multiply(
          [1, 0, 0, 1, x, y],
          [Math.cos(a), Math.sin(a), -Math.sin(a), Math.cos(a), 0, 0]
        ),
        [1, 0, 0, 1, -x, -y]
      );
    } else if (match[1] === "matrix" && v.length === 6) next = v as Matrix;
    else if (match[1] === "skewX")
      next = [1, 0, Math.tan((v[0] * Math.PI) / 180), 1, 0, 0];
    else if (match[1] === "skewY")
      next = [1, Math.tan((v[0] * Math.PI) / 180), 0, 1, 0, 0];
    else throw new Error(`Canvas: unsupported transform ${match[1]}`);
    result = multiply(result, next);
  }
  return result;
};
const transform = (ctx: CanvasRenderingContext2D, value: unknown) => {
  const m = transformMatrix(value);
  ctx.transform(...m);
  return m;
};

const shape = (
  ctx: CanvasRenderingContext2D,
  type: string,
  p: Props
): Bounds => {
  const x = number(p.x),
    y = number(p.y),
    width = number(p.width),
    height = number(p.height);
  if (type === "path") {
    tracePath(ctx, String(p.d ?? ""));
    return pathBounds(String(p.d ?? ""));
  }
  if (type === "rect") {
    const rx = Math.min(width / 2, Math.max(0, number(p.rx, number(p.ry))));
    const ry = Math.min(height / 2, Math.max(0, number(p.ry, rx)));
    if (rx && ry) {
      const k = 0.5522847498307936;
      ctx.moveTo(x + rx, y);
      ctx.lineTo(x + width - rx, y);
      ctx.bezierCurveTo(
        x + width - rx + k * rx,
        y,
        x + width,
        y + ry - k * ry,
        x + width,
        y + ry
      );
      ctx.lineTo(x + width, y + height - ry);
      ctx.bezierCurveTo(
        x + width,
        y + height - ry + k * ry,
        x + width - rx + k * rx,
        y + height,
        x + width - rx,
        y + height
      );
      ctx.lineTo(x + rx, y + height);
      ctx.bezierCurveTo(
        x + rx - k * rx,
        y + height,
        x,
        y + height - ry + k * ry,
        x,
        y + height - ry
      );
      ctx.lineTo(x, y + ry);
      ctx.bezierCurveTo(x, y + ry - k * ry, x + rx - k * rx, y, x + rx, y);
      ctx.closePath();
    } else ctx.rect(x, y, width, height);
    return { x, y, width, height };
  }
  if (type === "circle" || type === "ellipse") {
    const cx = number(p.cx),
      cy = number(p.cy),
      rx = number(type === "circle" ? p.r : p.rx),
      ry = number(type === "circle" ? p.r : p.ry);
    if (rx > 0 && ry > 0) {
      if (type === "circle") ctx.arc(cx, cy, rx, 0, Math.PI * 2);
      else {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(rx, ry);
        ctx.arc(0, 0, 1, 0, Math.PI * 2);
        ctx.restore();
      }
    }
    return { x: cx - rx, y: cy - ry, width: 2 * rx, height: 2 * ry };
  }
  if (type === "line") {
    const x1 = number(p.x1),
      y1 = number(p.y1),
      x2 = number(p.x2),
      y2 = number(p.y2);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    return {
      x: Math.min(x1, x2),
      y: Math.min(y1, y2),
      width: Math.abs(x2 - x1),
      height: Math.abs(y2 - y1),
    };
  }
  if (type === "polygon" || type === "polyline") {
    const points = list(p.points);
    const xs: number[] = [],
      ys: number[] = [];
    for (let i = 0; i + 1 < points.length; i += 2) {
      if (i) ctx.lineTo(points[i], points[i + 1]);
      else ctx.moveTo(points[i], points[i + 1]);
      xs.push(points[i]);
      ys.push(points[i + 1]);
    }
    if (type === "polygon") ctx.closePath();
    const left = xs.length ? Math.min(...xs) : 0,
      top = ys.length ? Math.min(...ys) : 0;
    return {
      x: left,
      y: top,
      width: xs.length ? Math.max(...xs) - left : 0,
      height: ys.length ? Math.max(...ys) - top : 0,
    };
  }
  if (type === "text") return { x, y, width: 0, height: 0 };
  throw new Error(`Canvas: unsupported graphic ${type}`);
};

const rgba = (color: string, alpha: number) => {
  const parsed = parseColor(color);
  if (parsed) return hsvToCss(parsed.h, parsed.s, parsed.v, parsed.a * alpha);
  const hex = /^#([\da-f]{3}|[\da-f]{6})$/iu.exec(color)?.[1];
  if (hex) {
    const h = hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex;
    return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${alpha})`;
  }
  const rgb = /^rgba?\(([^)]+)\)$/u.exec(color);
  if (rgb) {
    const v = list(rgb[1]);
    return `rgba(${v[0]},${v[1]},${v[2]},${(v[3] ?? 1) * alpha})`;
  }
  if (alpha === 1) return color;
  throw new Error(
    `Canvas: gradient stop opacity requires a resolved RGB color: ${color}`
  );
};

/** Paint supported React shape primitives directly; no XML or image decoding. */
export const paintGraphics = (
  context: CanvasRenderingContext2D,
  children: ReactNode,
  options?: GraphicPaintOptions
) => {
  let ctx = context;
  let depth = 0;
  const definitions = new Map<
    string,
    NonNullable<ReturnType<typeof element>>
  >();
  const collect = (nodes: ReactNode) =>
    Children.forEach(nodes, (child) => {
      const node = element(child);
      if (!node) return;
      if (typeof node.props.id === "string")
        definitions.set(node.props.id, node);
      collect(node.props.children);
    });
  collect(children);
  const paint = (
    value: unknown,
    box: Bounds
  ): string | CanvasGradient | CanvasPattern => {
    const id = refId(value);
    if (!id) return String(value);
    const definition = definitions.get(id);
    if (definition?.type === "pattern" && options) {
      const p = definition.props,
        user = p.patternUnits === "userSpaceOnUse";
      const dimension = (v: unknown, size: number) =>
        typeof v === "string" && v.endsWith("%")
          ? (parseFloat(v) / 100) * size
          : number(v) * (user ? 1 : size);
      const width = dimension(
          p.width,
          user ? (options.viewBox?.width ?? box.width) : box.width
        ),
        height = dimension(
          p.height,
          user ? (options.viewBox?.height ?? box.height) : box.height
        );
      const x =
          dimension(
            p.x,
            user ? (options.viewBox?.width ?? box.width) : box.width
          ) + (user ? 0 : box.x),
        y =
          dimension(
            p.y,
            user ? (options.viewBox?.height ?? box.height) : box.height
          ) + (user ? 0 : box.y);
      if (width <= 0 || height <= 0) return "transparent";
      const tile = options.target(
        `pattern-${id}`,
        Math.ceil(width),
        Math.ceil(height)
      );
      const main = ctx;
      ctx = tile.getContext("2d");
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, tile.width, tile.height);
      ctx.save();
      try {
        ctx.scale(tile.width / width, tile.height / height);
        if (p.patternContentUnits === "objectBoundingBox")
          ctx.scale(box.width, box.height);
        visit(p.children);
      } finally {
        ctx.restore();
        ctx = main;
      }
      const pattern = ctx.createPattern(
        tile as unknown as CanvasImageSource,
        "repeat"
      );
      if (!pattern) throw new Error(`Canvas: cannot create pattern ${id}`);
      // The existing Plot pattern API supports a pattern-local transform.
      if (pattern.setTransform) {
        const m = multiply(transformMatrix(p.patternTransform), [
          width / tile.width,
          0,
          0,
          height / tile.height,
          x,
          y,
        ]);
        pattern.setTransform({
          a: m[0],
          b: m[1],
          c: m[2],
          d: m[3],
          e: m[4],
          f: m[5],
        });
      }
      return pattern;
    }
    if (!definition || definition.type !== "linearGradient")
      throw new Error(`Canvas: unsupported paint reference ${id}`);
    const p = definition.props,
      user = p.gradientUnits === "userSpaceOnUse";
    const coordinate = (v: unknown, extent: number, fallback: number) => {
      const percent = typeof v === "string" && v.endsWith("%");
      const n =
        v === undefined ? fallback : percent ? parseFloat(v) / 100 : Number(v);
      return user && percent ? n * extent : n;
    };
    const viewport = options?.viewBox ?? box;
    const x1 = coordinate(p.x1, viewport.width, 0),
      y1 = coordinate(p.y1, viewport.height, 0),
      x2 = coordinate(p.x2, viewport.width, 1),
      y2 = coordinate(p.y2, viewport.height, 0);
    const m = multiply(
      user ? identity : [box.width || 1, 0, 0, box.height || 1, box.x, box.y],
      transformMatrix(p.gradientTransform)
    );
    const vx = x2 - x1,
      vy = y2 - y1,
      length = vx * vx + vy * vy || 1;
    const determinant = m[0] * m[3] - m[1] * m[2] || 1;
    // Transform the gradient normal (inverse transpose), not its endpoint
    // vector: non-square object bounds otherwise rotate a diagonal gradient.
    const nx = (m[3] * vx - m[1] * vy) / determinant / length,
      ny = (-m[2] * vx + m[0] * vy) / determinant / length;
    const norm = nx * nx + ny * ny || 1;
    const startX = m[0] * x1 + m[2] * y1 + m[4],
      startY = m[1] * x1 + m[3] * y1 + m[5];
    const gradient = ctx.createLinearGradient(
      startX,
      startY,
      startX + nx / norm,
      startY + ny / norm
    );
    Children.forEach(p.children, (child) => {
      const stop = element(child);
      if (!stop || stop.type !== "stop") return;
      const offset = stop.props.offset;
      const at =
        typeof offset === "string" && offset.endsWith("%")
          ? parseFloat(offset) / 100
          : number(offset);
      const color = String(stop.props.stopColor ?? "#000000"),
        alpha = number(stop.props.stopOpacity, 1);
      let stopColor: string;
      try {
        stopColor = rgba(color, alpha);
      } catch (error) {
        if (!options) throw error;
        const pixel = options.target("color", 1, 1).getContext("2d");
        pixel.clearRect(0, 0, 1, 1);
        pixel.fillStyle = color;
        pixel.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = pixel.getImageData(0, 0, 1, 1).data;
        stopColor = `rgba(${r},${g},${b},${(a / 255) * alpha})`;
      }
      gradient.addColorStop(Math.max(0, Math.min(1, at)), stopColor);
    });
    return gradient;
  };
  const inherited = [
    "fill",
    "stroke",
    "strokeWidth",
    "strokeLinecap",
    "strokeLinejoin",
    "strokeMiterlimit",
    "strokeDasharray",
    "strokeDashoffset",
    "fillOpacity",
    "strokeOpacity",
    "fillRule",
    "fontSize",
    "fontFamily",
    "fontWeight",
    "textAnchor",
    "dominantBaseline",
  ];
  const clipShapes = (nodes: ReactNode) =>
    Children.forEach(nodes, (child) => {
      const node = element(child);
      if (!node) return;
      ctx.save();
      try {
        transform(ctx, node.props.transform);
        if (node.type === "g" || node.type === Fragment)
          clipShapes(node.props.children);
        else if (typeof node.type === "string")
          shape(ctx, node.type, node.props);
      } finally {
        ctx.restore();
      }
    });
  const visit = (
    nodes: ReactNode,
    parent: Props = { fill: "#000000", stroke: "none" },
    parentMatrix: Matrix = options?.matrix ?? identity
  ) =>
    Children.forEach(nodes, (child) => {
      const node = element(child);
      if (!node) return;
      if (node.type === Fragment) {
        visit(node.props.children, parent, parentMatrix);
        return;
      }
      const type = node.type;
      if (
        type === "defs" ||
        type === "clipPath" ||
        type === "linearGradient" ||
        type === "pattern" ||
        type === "stop"
      )
        return;
      if (typeof type !== "string")
        throw new Error("Canvas accepts only graphic primitives and fragments");
      const p = { ...parent, ...node.props };
      ctx.save();
      try {
        ctx.globalAlpha *= number(node.props.opacity, 1);
        const matrix = multiply(parentMatrix, transform(ctx, p.transform));
        const clip = definitions.get(refId(p.clipPath) ?? "");
        if (clip) {
          let bounds: Bounds | undefined;
          if (
            clip.props.clipPathUnits === "objectBoundingBox" &&
            type !== "g"
          ) {
            ctx.beginPath();
            bounds = shape(ctx, type, p);
          }
          ctx.beginPath();
          ctx.save();
          try {
            if (bounds) {
              ctx.translate(bounds.x, bounds.y);
              ctx.scale(bounds.width, bounds.height);
            }
            transform(ctx, clip.props.transform);
            clipShapes(clip.props.children);
          } finally {
            ctx.restore();
          }
          ctx.clip(clip.props.clipRule === "evenodd" ? "evenodd" : "nonzero");
        }
        if (type === "g") {
          const inheritedProps = Object.fromEntries(
            inherited
              .filter((key) => p[key] !== undefined)
              .map((key) => [key, p[key]])
          );
          if (number(node.props.opacity, 1) < 1 && options) {
            // Composite a group once. Applying alpha per mark darkens overlaps.
            const main = ctx;
            const layer = options.target(
              `group-${depth++}`,
              options.width,
              options.height
            );
            ctx = layer.getContext("2d");
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, layer.width, layer.height);
            ctx.save();
            try {
              ctx.setTransform(...matrix);
              ctx.globalAlpha = 1;
              visit(node.props.children, inheritedProps, matrix);
            } finally {
              ctx.restore();
              ctx = main;
              depth--;
            }
            ctx.save();
            try {
              ctx.setTransform(1, 0, 0, 1, 0, 0);
              ctx.drawImage(layer as unknown as CanvasImageSource, 0, 0);
            } finally {
              ctx.restore();
            }
          } else visit(node.props.children, inheritedProps, matrix);
          return;
        }
        ctx.beginPath();
        const bounds = shape(ctx, type, p);
        ctx.lineWidth = number(p.strokeWidth, 1);
        ctx.lineCap = String(p.strokeLinecap ?? "butt") as CanvasLineCap;
        ctx.lineJoin = String(p.strokeLinejoin ?? "miter") as CanvasLineJoin;
        ctx.miterLimit = number(p.strokeMiterlimit, 4);
        ctx.setLineDash(
          p.strokeDasharray === "none" ? [] : list(p.strokeDasharray)
        );
        ctx.lineDashOffset = number(p.strokeDashoffset);
        const alpha = ctx.globalAlpha;
        if (type === "text") {
          ctx.font = `${p.fontWeight ?? "normal"} ${number(p.fontSize, 16)}px ${p.fontFamily ?? "serif"}`;
          ctx.textAlign =
            p.textAnchor === "middle"
              ? "center"
              : p.textAnchor === "end"
                ? "right"
                : "left";
          ctx.textBaseline =
            p.dominantBaseline === "middle" || p.dominantBaseline === "central"
              ? "middle"
              : p.dominantBaseline === "hanging"
                ? "hanging"
                : "alphabetic";
        }
        const text = Children.toArray(p.children)
          .filter((v) => typeof v === "string" || typeof v === "number")
          .join("");
        if (p.fill !== "none") {
          ctx.fillStyle = paint(p.fill, bounds);
          ctx.globalAlpha = alpha * number(p.fillOpacity, 1);
          if (type === "text") ctx.fillText(text, number(p.x), number(p.y));
          else ctx.fill(p.fillRule === "evenodd" ? "evenodd" : "nonzero");
        }
        if (p.stroke !== "none" && number(p.strokeWidth, 1) > 0) {
          ctx.strokeStyle = paint(p.stroke, bounds);
          ctx.globalAlpha = alpha * number(p.strokeOpacity, 1);
          if (type === "text") ctx.strokeText(text, number(p.x), number(p.y));
          else ctx.stroke();
        }
      } finally {
        ctx.restore();
      }
    });
  visit(children);
};
