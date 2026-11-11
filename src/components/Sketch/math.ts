import type { SketchItem } from "./types";

export const strokePath = (points: number[]): string => {
  const count = points.length / 2;
  if (count === 0) {
    return "";
  }
  if (count === 1) {
    return `M${points[0]},${points[1]} l0.01,0`;
  }
  let d = `M${points[0]},${points[1]}`;
  for (let i = 1; i < count; i += 1) {
    const px = points[(i - 1) * 2] ?? 0;
    const py = points[(i - 1) * 2 + 1] ?? 0;
    const x = points[i * 2] ?? 0;
    const y = points[i * 2 + 1] ?? 0;
    d += ` Q${px},${py} ${(px + x) / 2},${(py + y) / 2}`;
  }
  d += ` L${points[(count - 1) * 2]},${points[(count - 1) * 2 + 1]}`;
  return d;
};
const n = (value: number): string => `${Math.round(value * 10) / 10}`;
export const shapePath = (
  shape: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  width: number
): string => {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const w = Math.abs(x2 - x1);
  const h = Math.abs(y2 - y1);
  const cx = left + w / 2;
  const cy = top + h / 2;
  switch (shape) {
    case 0: {
      return `M${n(x1)},${n(y1)} L${n(x2)},${n(y2)}`;
    }
    case 1: {
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const length = Math.hypot(x2 - x1, y2 - y1);
      const head = Math.min(Math.max(14, width * 3), length * 0.5);
      const spread = Math.PI / 6;
      const ax = x2 - head * Math.cos(angle - spread);
      const ay = y2 - head * Math.sin(angle - spread);
      const bx = x2 - head * Math.cos(angle + spread);
      const by = y2 - head * Math.sin(angle + spread);
      return (
        `M${n(x1)},${n(y1)} L${n(x2)},${n(y2)} ` +
        `M${n(ax)},${n(ay)} L${n(x2)},${n(y2)} L${n(bx)},${n(by)}`
      );
    }
    case 2: {
      return (
        `M${n(left)},${n(top)} H${n(left + w)} V${n(top + h)} ` +
        `H${n(left)} Z`
      );
    }
    case 3: {
      const rx = Math.max(w / 2, 0.5);
      const ry = Math.max(h / 2, 0.5);
      return (
        `M${n(cx - rx)},${n(cy)} A${n(rx)},${n(ry)} 0 1 0 ${n(cx + rx)},${n(cy)} ` +
        `A${n(rx)},${n(ry)} 0 1 0 ${n(cx - rx)},${n(cy)} Z`
      );
    }
    case 4: {
      return (
        `M${n(cx)},${n(top)} L${n(left + w)},${n(top + h)} ` +
        `L${n(left)},${n(top + h)} Z`
      );
    }
    case 5: {
      return (
        `M${n(cx)},${n(top)} L${n(left + w)},${n(cy)} ` +
        `L${n(cx)},${n(top + h)} L${n(left)},${n(cy)} Z`
      );
    }
    case 6: {
      let d = "";
      for (let i = 0; i < 10; i += 1) {
        const r = i % 2 === 0 ? 1 : 0.42;
        const a = -Math.PI / 2 + (i * Math.PI) / 5;
        const px = cx + (w / 2) * r * Math.cos(a);
        const py = cy + (h / 2) * r * Math.sin(a) + h * 0.05;
        d += `${i === 0 ? "M" : "L"}${n(px)},${n(py)} `;
      }
      return `${d}Z`;
    }
    default: {
      const X = (u: number) => n(left + u * w);
      const Y = (v: number) => n(top + v * h);
      return (
        `M${X(0.5)},${Y(0.92)} ` +
        `C${X(0.18)},${Y(0.7)} ${X(0)},${Y(0.48)} ${X(0)},${Y(0.3)} ` +
        `C${X(0)},${Y(0.12)} ${X(0.14)},${Y(0)} ${X(0.29)},${Y(0)} ` +
        `C${X(0.4)},${Y(0)} ${X(0.47)},${Y(0.07)} ${X(0.5)},${Y(0.16)} ` +
        `C${X(0.53)},${Y(0.07)} ${X(0.6)},${Y(0)} ${X(0.71)},${Y(0)} ` +
        `C${X(0.86)},${Y(0)} ${X(1)},${Y(0.12)} ${X(1)},${Y(0.3)} ` +
        `C${X(1)},${Y(0.48)} ${X(0.82)},${Y(0.7)} ${X(0.5)},${Y(0.92)} Z`
      );
    }
  }
};
export const safeId = (id: string): string =>
  id.replaceAll(/[^a-zA-Z0-9_-]/gu, "");
export const foldLayers = <T>(
  items: SketchItem[],
  ink: (
    item: Exclude<
      SketchItem,
      {
        type: "erase";
      }
    >,
    index: number
  ) => T,
  wrap: (
    content: T[],
    erases: Extract<
      SketchItem,
      {
        type: "erase";
      }
    >[],
    layer: number
  ) => T
): T[] => {
  let content: T[] = [];
  let erases: Extract<
    SketchItem,
    {
      type: "erase";
    }
  >[] = [];
  let layer = 0;
  const flush = () => {
    if (erases.length === 0) {
      return;
    }
    content = [wrap(content, erases, layer)];
    erases = [];
    layer += 1;
  };
  for (const [index, item] of items.entries()) {
    if (item.type === "erase") {
      erases.push(item);
      continue;
    }
    flush();
    content.push(ink(item, index));
  }
  flush();
  return content;
};
const escapeAttribute = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
export const svgDocument = (
  items: SketchItem[],
  width: number,
  height: number,
  id: string
): string => {
  const w = Math.round(width) || 1;
  const h = Math.round(height) || 1;
  const defs: string[] = [];
  const body = foldLayers<string>(
    items,
    (item) =>
      `<path d="${escapeAttribute(item.d)}" fill="none" stroke="${escapeAttribute(item.color)}" stroke-width="${item.width}" ` +
      'stroke-linecap="round" stroke-linejoin="round"/>',
    (content, erases, layer) => {
      const mask = `${safeId(id)}-m${layer}`;
      defs.push(
        `<mask id="${mask}" maskUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}">` +
          `<rect x="0" y="0" width="${w}" height="${h}" fill="white"/>${erases
            .map(
              (erase) =>
                `<path d="${escapeAttribute(erase.d)}" fill="none" stroke="black" stroke-width="${erase.width}" ` +
                'stroke-linecap="round" stroke-linejoin="round"/>'
            )
            .join("")}</mask>`
      );
      return `<g mask="url(#${mask})">${content.join("")}</g>`;
    }
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs.length ? `<defs>${defs.join("")}</defs>` : ""}${body.join("")}</svg>`;
};
