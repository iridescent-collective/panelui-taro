export type QRCodeModuleShape =
  | "square"
  | "rounded"
  | "dot"
  | "classy"
  | "diamond";
export type QRCodeEyeFrameShape =
  | "square"
  | "rounded"
  | "circle"
  | "leaf"
  | "shield";
export type QRCodeEyeBallShape =
  | "square"
  | "rounded"
  | "dot"
  | "diamond"
  | "leaf";
export const FINDER_SIZE = 7;
const INSET = 0.05;
type Corners = [number, number, number, number];
function roundedRect(
  x: number,
  y: number,
  w: number,
  h: number,
  r: Corners
): string {
  const [tl, tr, br, bl] = r;
  return (
    `M${x + tl} ${y}` +
    `H${x + w - tr}A${tr} ${tr} 0 0 1 ${x + w} ${y + tr}` +
    `V${y + h - br}A${br} ${br} 0 0 1 ${x + w - br} ${y + h}` +
    `H${x + bl}A${bl} ${bl} 0 0 1 ${x} ${y + h - bl}` +
    `V${y + tl}A${tl} ${tl} 0 0 1 ${x + tl} ${y}` +
    "Z"
  );
}
function circle(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
}
function diamond(cx: number, cy: number, r: number): string {
  return `M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z`;
}
function neighbours(modules: boolean[][], x: number, y: number, size: number) {
  const at = (nx: number, ny: number) =>
    nx >= 0 && ny >= 0 && nx < size && ny < size && !!modules[ny]![nx];
  return {
    down: at(x, y + 1),
    left: at(x - 1, y),
    right: at(x + 1, y),
    up: at(x, y - 1),
  };
}
export function inFinder(x: number, y: number, size: number): boolean {
  const far = size - FINDER_SIZE;
  return (
    (x < FINDER_SIZE && y < FINDER_SIZE) ||
    (x >= far && y < FINDER_SIZE) ||
    (x < FINDER_SIZE && y >= far)
  );
}
export type QRCodeEyeCorner = "tl" | "tr" | "bl";
export function finderOrigins(
  size: number
): [number, number, QRCodeEyeCorner][] {
  const far = size - FINDER_SIZE;
  return [
    [0, 0, "tl"],
    [far, 0, "tr"],
    [0, far, "bl"],
  ];
}
export function modulePath(
  shape: QRCodeModuleShape,
  modules: boolean[][],
  x: number,
  y: number,
  size: number,
  offset: number
): string {
  const px = x + offset;
  const py = y + offset;
  if (shape === "square") {
    return `M${px} ${py}h1v1h-1z`;
  }
  if (shape === "dot") {
    return circle(px + 0.5, py + 0.5, 0.5 - INSET);
  }
  if (shape === "diamond") {
    return diamond(px + 0.5, py + 0.5, 0.5);
  }
  const { up, right, down, left } = neighbours(modules, x, y, size);
  const r = 0.5;
  const tl = up || left ? 0 : r;
  const tr = up || right ? 0 : r;
  const br = down || right ? 0 : r;
  const bl = down || left ? 0 : r;
  if (shape === "classy") {
    return roundedRect(px, py, 1, 1, [tl, 0, br, 0]);
  }
  return roundedRect(px, py, 1, 1, [tl, tr, br, bl]);
}
export function eyeFramePath(
  shape: QRCodeEyeFrameShape,
  x: number,
  y: number,
  offset: number,
  corner: QRCodeEyeCorner = "tl"
): string {
  const px = x + offset;
  const py = y + offset;
  const s = FINDER_SIZE;
  const inner = s - 2;
  if (shape === "circle") {
    return (
      circle(px + s / 2, py + s / 2, s / 2) +
      circle(px + s / 2, py + s / 2, inner / 2)
    );
  }
  const SHARP: Record<QRCodeEyeCorner, Corners> = {
    bl: [3.5, 3.5, 3.5, 0],
    tl: [0, 3.5, 3.5, 3.5],
    tr: [3.5, 0, 3.5, 3.5],
  };
  const outer: Record<Exclude<QRCodeEyeFrameShape, "circle">, Corners> = {
    leaf: [3.5, 0, 3.5, 0],
    rounded: [2, 2, 2, 2],
    shield: SHARP[corner],
    square: [0, 0, 0, 0],
  };
  const o = outer[shape as Exclude<QRCodeEyeFrameShape, "circle">];
  const i = o.map((value) => Math.max(value - 1, 0)) as Corners;
  return (
    roundedRect(px, py, s, s, o) + roundedRect(px + 1, py + 1, inner, inner, i)
  );
}
export function eyeBallPath(
  shape: QRCodeEyeBallShape,
  x: number,
  y: number,
  offset: number
): string {
  const px = x + offset + 2;
  const py = y + offset + 2;
  const s = 3;
  if (shape === "square") {
    return `M${px} ${py}h${s}v${s}h${-s}z`;
  }
  if (shape === "dot") {
    return circle(px + s / 2, py + s / 2, s / 2);
  }
  if (shape === "diamond") {
    return diamond(px + s / 2, py + s / 2, s / 2);
  }
  if (shape === "leaf") {
    return roundedRect(px, py, s, s, [1.5, 0, 1.5, 0]);
  }
  return roundedRect(px, py, s, s, [1, 1, 1, 1]);
}
