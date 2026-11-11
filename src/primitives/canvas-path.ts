/** SVG path syntax is retained as geometry, never serialized into an image. */
export type PathContext = Pick<
  CanvasRenderingContext2D,
  "moveTo" | "lineTo" | "bezierCurveTo" | "quadraticCurveTo" | "closePath"
>;
type Command = { kind: "M" | "L" | "C" | "Q" | "Z"; values: number[] };
const counts: Record<string, number> = {
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  S: 4,
  Q: 4,
  T: 2,
  A: 7,
  Z: 0,
};
const cache = new Map<string, Command[]>();

const arc = (
  x: number,
  y: number,
  rx: number,
  ry: number,
  angle: number,
  large: number,
  sweep: number,
  ex: number,
  ey: number
): Command[] => {
  rx = Math.abs(rx);
  ry = Math.abs(ry);
  if (x === ex && y === ey) return [];
  if (!rx || !ry) return [{ kind: "L", values: [ex, ey] }];
  const phi = (angle * Math.PI) / 180;
  const cos = Math.cos(phi),
    sin = Math.sin(phi);
  const px = (cos * (x - ex)) / 2 + (sin * (y - ey)) / 2;
  const py = (-sin * (x - ex)) / 2 + (cos * (y - ey)) / 2;
  const size = (px * px) / (rx * rx) + (py * py) / (ry * ry);
  if (size > 1) {
    rx *= Math.sqrt(size);
    ry *= Math.sqrt(size);
  }
  const scale =
    (large === sweep ? -1 : 1) *
    Math.sqrt(
      Math.max(
        0,
        (rx * rx * ry * ry - rx * rx * py * py - ry * ry * px * px) /
          (rx * rx * py * py + ry * ry * px * px)
      )
    );
  const cxp = (scale * rx * py) / ry,
    cyp = (-scale * ry * px) / rx;
  const cx = cos * cxp - sin * cyp + (x + ex) / 2;
  const cy = sin * cxp + cos * cyp + (y + ey) / 2;
  const start = Math.atan2((py - cyp) / ry, (px - cxp) / rx);
  let delta = Math.atan2((-py - cyp) / ry, (-px - cxp) / rx) - start;
  if (sweep && delta < 0) delta += 2 * Math.PI;
  if (!sweep && delta > 0) delta -= 2 * Math.PI;
  const steps = Math.ceil(Math.abs(delta) / (Math.PI / 2));
  const point = (a: number) => [
    cx + cos * rx * Math.cos(a) - sin * ry * Math.sin(a),
    cy + sin * rx * Math.cos(a) + cos * ry * Math.sin(a),
  ];
  const tangent = (a: number) => [
    -cos * rx * Math.sin(a) - sin * ry * Math.cos(a),
    -sin * rx * Math.sin(a) + cos * ry * Math.cos(a),
  ];
  const out: Command[] = [];
  for (let i = 0; i < steps; i++) {
    const a = start + (delta * i) / steps,
      b = start + (delta * (i + 1)) / steps;
    const k = (4 / 3) * Math.tan((b - a) / 4);
    const p = point(a),
      q = point(b),
      u = tangent(a),
      v = tangent(b);
    out.push({
      kind: "C",
      values: [
        p[0] + k * u[0],
        p[1] + k * u[1],
        q[0] - k * v[0],
        q[1] - k * v[1],
        ...q,
      ],
    });
  }
  if (out.length) out[out.length - 1].values.splice(4, 2, ex, ey);
  return out;
};

export const pathCommands = (path: string): readonly Command[] => {
  const cached = cache.get(path);
  if (cached) return cached;
  const tokenPattern =
    /[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/gu;
  const tokens = path.match(tokenPattern) ?? [];
  if (path.replace(tokenPattern, "").replace(/[\s,]/gu, ""))
    throw new Error("Canvas: invalid path syntax");
  let i = 0,
    x = 0,
    y = 0,
    sx = 0,
    sy = 0,
    cx = 0,
    cy = 0,
    command = "",
    previous = "";
  const out: Command[] = [];
  while (i < tokens.length) {
    if (/^[a-z]$/iu.test(tokens[i])) command = tokens[i++];
    const kind = command.toUpperCase(),
      relative = command !== kind;
    const count = counts[kind];
    if (count === undefined || !command || i + count > tokens.length)
      throw new Error(`Canvas: invalid path command ${command}`);
    const v = tokens.slice(i, i + count).map(Number);
    if (v.some((value) => !Number.isFinite(value)))
      throw new Error("Canvas: incomplete path coordinates");
    i += count;
    const dx = relative ? x : 0,
      dy = relative ? y : 0;
    let endX = x,
      endY = y;
    if (kind === "Z") {
      out.push({ kind: "Z", values: [] });
      x = sx;
      y = sy;
      command = "";
      previous = kind;
      continue;
    }
    if (kind === "H") {
      endX = v[0] + dx;
      out.push({ kind: "L", values: [endX, y] });
    } else if (kind === "V") {
      endY = v[0] + dy;
      out.push({ kind: "L", values: [x, endY] });
    } else if (kind === "A") {
      if (![0, 1].includes(v[3]) || ![0, 1].includes(v[4]))
        throw new Error("Canvas: invalid arc flags");
      endX = v[5] + dx;
      endY = v[6] + dy;
      out.push(...arc(x, y, v[0], v[1], v[2], v[3], v[4], endX, endY));
    } else {
      for (let j = 0; j < v.length; j += 2) {
        v[j] += dx;
        v[j + 1] += dy;
      }
      endX = v[v.length - 2];
      endY = v[v.length - 1];
      if (kind === "M" || kind === "L") {
        out.push({ kind, values: v });
        if (kind === "M") {
          sx = endX;
          sy = endY;
          command = relative ? "l" : "L";
        }
      } else if (kind === "C" || kind === "S") {
        const values =
          kind === "S"
            ? [
                previous === "C" || previous === "S" ? 2 * x - cx : x,
                previous === "C" || previous === "S" ? 2 * y - cy : y,
                ...v,
              ]
            : v;
        out.push({ kind: "C", values });
        cx = values[2];
        cy = values[3];
      } else if (kind === "Q" || kind === "T") {
        const values =
          kind === "T"
            ? [
                previous === "Q" || previous === "T" ? 2 * x - cx : x,
                previous === "Q" || previous === "T" ? 2 * y - cy : y,
                ...v,
              ]
            : v;
        out.push({ kind: "Q", values });
        cx = values[0];
        cy = values[1];
      }
    }
    x = endX;
    y = endY;
    previous = kind;
  }
  // Live paths change continuously. Never retain an unbounded frame history.
  if (path.length <= 16_384) {
    if (cache.size >= 128) cache.delete(cache.keys().next().value!);
    cache.set(path, out);
  }
  return out;
};

export const tracePath = (ctx: PathContext, path: string) => {
  for (const { kind, values: v } of pathCommands(path)) {
    if (kind === "M") ctx.moveTo(v[0], v[1]);
    else if (kind === "L") ctx.lineTo(v[0], v[1]);
    else if (kind === "C")
      ctx.bezierCurveTo(v[0], v[1], v[2], v[3], v[4], v[5]);
    else if (kind === "Q") ctx.quadraticCurveTo(v[0], v[1], v[2], v[3]);
    else ctx.closePath();
  }
};

export const pathBounds = (path: string) => {
  let x = 0,
    y = 0,
    sx = 0,
    sy = 0;
  const xs: number[] = [],
    ys: number[] = [];
  const add = (px: number, py: number) => {
    xs.push(px);
    ys.push(py);
  };
  const cubic = (a: number, b: number, c: number, d: number, t: number) =>
    (1 - t) ** 3 * a +
    3 * (1 - t) ** 2 * t * b +
    3 * (1 - t) * t * t * c +
    t ** 3 * d;
  const roots = (a: number, b: number, c: number, d: number) => {
    const A = -a + 3 * b - 3 * c + d,
      B = 2 * (a - 2 * b + c),
      C = b - a;
    if (Math.abs(A) < 1e-12) return Math.abs(B) < 1e-12 ? [] : [-C / B];
    const disc = B * B - 4 * A * C;
    return disc < 0
      ? []
      : [(-B + Math.sqrt(disc)) / (2 * A), (-B - Math.sqrt(disc)) / (2 * A)];
  };
  for (const { kind, values: v } of pathCommands(path)) {
    if (kind === "Z") {
      x = sx;
      y = sy;
      add(x, y);
      continue;
    }
    const ex = v[v.length - 2],
      ey = v[v.length - 1];
    if (kind === "C" || kind === "Q") {
      const c =
        kind === "C"
          ? v
          : [
              x + (2 / 3) * (v[0] - x),
              y + (2 / 3) * (v[1] - y),
              ex + (2 / 3) * (v[0] - ex),
              ey + (2 / 3) * (v[1] - ey),
              ex,
              ey,
            ];
      for (const t of [
        ...roots(x, c[0], c[2], ex),
        ...roots(y, c[1], c[3], ey),
      ]) {
        if (t > 0 && t < 1)
          add(cubic(x, c[0], c[2], ex, t), cubic(y, c[1], c[3], ey, t));
      }
    }
    x = ex;
    y = ey;
    add(x, y);
    if (kind === "M") {
      sx = x;
      sy = y;
    }
  }
  const left = xs.length ? Math.min(...xs) : 0,
    top = ys.length ? Math.min(...ys) : 0;
  return {
    x: left,
    y: top,
    width: xs.length ? Math.max(...xs) - left : 0,
    height: ys.length ? Math.max(...ys) - top : 0,
  };
};
