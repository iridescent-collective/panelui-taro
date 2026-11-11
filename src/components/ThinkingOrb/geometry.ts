import { BUCKETS, MIN_INK, MIN_RADIUS, SHAPES } from "./constants";
import type { ThinkingOrbState, Profile } from "./types";

const hashD = (a: number, b: number): number => {
  const h = Math.sin(a * 12.9898 + b * 78.233) * 43_758.5453;
  return h - Math.floor(h);
};
const angleDelta = (a: number, b: number): number =>
  Math.atan2(Math.sin(a - b), Math.cos(a - b));
const q = (value: number): number => Math.round(value * 10) / 10;
const radiusScale = (size: number): number => (size / 300) ** 0.6;
const dot = (
  out: string[],
  x: number,
  y: number,
  r: number,
  ink: number
): void => {
  if (ink < MIN_INK) {
    return;
  }
  const bucket = Math.min(BUCKETS - 1, Math.max(0, Math.floor(ink * BUCKETS)));
  const rr = q(Math.max(MIN_RADIUS, r));
  const d = q(rr * 2);
  out[bucket] +=
    `M${q(x - rr)} ${q(y)}a${rr} ${rr} 0 1 0 ${d} 0a${rr} ${rr} 0 1 0 ${-d} 0`;
};
const project = (
  out: number[],
  x: number,
  y: number,
  z: number,
  sy: number,
  cy: number,
  st: number,
  ct: number,
  ox: number,
  oy: number,
  scale: number
): void => {
  const x1 = x * cy + z * sy;
  const z1 = -x * sy + z * cy;
  const y1 = y * ct - z1 * st;
  out[0] = ox + x1 * scale;
  out[1] = oy - y1 * scale;
  out[2] = y * st + z1 * ct;
};
const drawWorking = (
  out: string[],
  size: number,
  t: number,
  p: Profile
): void => {
  const c = size / 2;
  const R = c * 0.82;
  const rs = radiusScale(size) * p.radius;
  const sy = Math.sin(t * 0.12);
  const cy = Math.cos(t * 0.12);
  const st = Math.sin(0.3);
  const ct = Math.cos(0.3);
  const v = [0, 0, 0];
  for (let orbit = 0; orbit < p.rows; orbit += 1) {
    const h1 = hashD(orbit, 1.7);
    const h2 = hashD(orbit, 5.2);
    const h3 = hashD(orbit, 8.9);
    const ro = R * (0.45 + 0.52 * h1);
    const theta = h1 * 2 * Math.PI;
    const phi = Math.acos(2 * h2 - 1);
    const nx = Math.sin(phi) * Math.cos(theta);
    const ny = Math.cos(phi);
    const nz = Math.sin(phi) * Math.sin(theta);
    const ul = Math.max(1e-6, Math.hypot(ny, nx));
    const ux = -ny / ul;
    const uy = nx / ul;
    const vx = -nz * uy;
    const vy = nz * ux;
    const vz = nx * uy - ny * ux;
    const speed = (0.25 + 0.55 * h3) * (h3 > 0.5 ? 1 : -1);
    for (let k = 0; k < p.density; k += 1) {
      const a = (k / p.density) * 2 * Math.PI;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      project(
        v,
        (ux * ca + vx * sa) * ro,
        (uy * ca + vy * sa) * ro,
        vz * sa * ro,
        sy,
        cy,
        st,
        ct,
        c,
        c,
        1
      );
      const depth = (v[2]! / ro + 1) / 2;
      dot(out, v[0]!, v[1]!, 0.9 * rs, 0.28 * (0.4 + 0.6 * depth));
    }
    for (let m = 0; m < 3; m += 1) {
      const a = t * speed + (m / 3) * 2 * Math.PI + h2 * 6;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      project(
        v,
        (ux * ca + vx * sa) * ro,
        (uy * ca + vy * sa) * ro,
        vz * sa * ro,
        sy,
        cy,
        st,
        ct,
        c,
        c,
        1
      );
      const depth = (v[2]! / ro + 1) / 2;
      dot(out, v[0]!, v[1]!, (1.2 + 1.6 * depth) * rs, 0.7 + 0.22 * depth);
    }
  }
};
const drawSearching = (
  out: string[],
  size: number,
  t: number,
  p: Profile
): void => {
  const c = size / 2;
  const R = c * 0.82;
  const rs = radiusScale(size) * p.radius;
  const spin = 0.5;
  const tilt = 0.4 + 0.06 * Math.sin(t * 0.35);
  const sy = Math.sin(t * spin);
  const cySpin = Math.cos(t * spin);
  const st = Math.sin(tilt);
  const ct = Math.cos(tilt);
  const scan = t * (spin + (1.7 - spin) * 4.1);
  const v = [0, 0, 0];
  for (let li = 0; li <= p.rows; li += 1) {
    const lat = -Math.PI / 2 + (li / p.rows) * Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const count = Math.max(1, Math.round(Math.abs(cosLat) * p.density));
    for (let lj = 0; lj < count; lj += 1) {
      const lon = (lj / count) * 2 * Math.PI;
      project(
        v,
        cosLat * Math.cos(lon),
        sinLat,
        cosLat * Math.sin(lon),
        sy,
        cySpin,
        st,
        ct,
        c,
        c,
        R
      );
      const depth = (v[2]! + 1) / 2;
      const delta = angleDelta(lon + t * spin, scan);
      const boost = Math.exp(-(delta * delta) / 0.18) * Math.max(0, v[2]!);
      const ink = 0.38 + 0.54 * depth;
      dot(
        out,
        v[0]!,
        v[1]!,
        (0.6 + 1.7 * depth + boost) * rs,
        ink * (0.45 + 0.55 * Math.min(1, boost))
      );
    }
  }
};
const drawSolving = (
  out: string[],
  size: number,
  t: number,
  p: Profile
): void => {
  const c = size / 2;
  const R = c * 0.82;
  const rs = radiusScale(size) * p.radius;
  const yaw = t * 0.55;
  const tilt = 0.35 + 0.1 * Math.sin(t * 0.9);
  const sy = Math.sin(yaw);
  const cySpin = Math.cos(yaw);
  const st = Math.sin(tilt);
  const ct = Math.cos(tilt);
  const v = [0, 0, 0];
  const moves = 10;
  const slot = 0.42;
  const rest = 1.2;
  const cycle = 2 * moves * slot + rest;
  const tc = t % cycle;
  const amount: number[] = [];
  let active = -1;
  for (let i = 0; i < moves; i += 1) {
    amount.push(0);
  }
  if (tc < 2 * moves * slot) {
    const index = Math.floor(tc / slot);
    const local = Math.min(1, (tc - index * slot) / slot / 0.7);
    const eased = 1 - (1 - local) ** 3;
    if (index < moves) {
      for (let i = 0; i < index; i += 1) {
        amount[i] = 1;
      }
      amount[index] = eased;
      active = index;
    } else {
      const undo = 2 * moves - 1 - index;
      for (let i = 0; i < undo; i += 1) {
        amount[i] = 1;
      }
      amount[undo] = 1 - eased;
      active = undo;
    }
  }
  for (let li = 0; li <= p.rows; li += 1) {
    const lat = -Math.PI / 2 + (li / p.rows) * Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const count = Math.max(1, Math.round(Math.abs(cosLat) * p.density));
    for (let lj = 0; lj < count; lj += 1) {
      const lon = (lj / count) * 2 * Math.PI;
      let x = cosLat * Math.cos(lon);
      let y = sinLat;
      let z = cosLat * Math.sin(lon);
      let inActive = false;
      for (let i = 0; i < moves; i += 1) {
        if (amount[i]! <= 0) {
          continue;
        }
        const axis = Math.min(2, Math.floor(hashD(i, 2.3) * 3));
        const lo = -1 + 0.5 * Math.min(3, Math.floor(hashD(i, 5.9) * 4));
        const coord = (() => {
          if (axis === 0) {
            return x;
          }
          if (axis === 1) {
            return y;
          }
          return z;
        })();
        if (coord < lo || coord >= lo + 0.5) {
          continue;
        }
        if (i === active) {
          inActive = true;
        }
        const dir = hashD(i, 7.7) < 0.5 ? 1 : -1;
        const a = ((dir * Math.PI) / 2) * amount[i]!;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        if (axis === 0) {
          const y2 = y * ca - z * sa;
          z = y * sa + z * ca;
          y = y2;
        } else if (axis === 1) {
          const x2 = x * ca + z * sa;
          z = -x * sa + z * ca;
          x = x2;
        } else {
          const x2 = x * ca - y * sa;
          y = x * sa + y * ca;
          x = x2;
        }
      }
      project(v, x, y, z, sy, cySpin, st, ct, c, c, R);
      const depth = (v[2]! + 1) / 2;
      dot(
        out,
        v[0]!,
        v[1]!,
        (0.6 + 1.7 * depth + (inActive ? 0.3 : 0)) * rs,
        0.38 + 0.54 * depth + (inActive ? 0.14 : 0)
      );
    }
  }
};
const drawListening = (
  out: string[],
  size: number,
  t: number,
  p: Profile
): void => {
  const c = size / 2;
  const R = c * 0.874;
  const rs = radiusScale(size) * p.radius;
  const sy = Math.sin(t * 0.18);
  const cySpin = Math.cos(t * 0.18);
  const st = Math.sin(0.38);
  const ct = Math.cos(0.38);
  const v = [0, 0, 0];
  for (let ri = 0; ri <= p.rows; ri += 1) {
    const lat = -Math.PI / 2 + (ri / p.rows) * Math.PI;
    const cosLat = Math.cos(lat);
    const sinLat = Math.sin(lat);
    const w =
      0.62 * Math.sin(t * 2.1 - ri * 0.52) +
      0.38 * Math.sin(t * 1.27 + ri * 0.83);
    const rr = R * (0.88 + 0.105 * w);
    const crest = Math.max(0, w);
    const count = Math.max(1, Math.round(Math.abs(cosLat) * p.density));
    for (let lj = 0; lj < count; lj += 1) {
      const lon = (lj / count) * 2 * Math.PI;
      project(
        v,
        cosLat * Math.cos(lon) * rr,
        sinLat * rr,
        cosLat * Math.sin(lon) * rr,
        sy,
        cySpin,
        st,
        ct,
        c,
        c,
        1
      );
      const depth = (v[2]! / R + 1) / 2;
      dot(
        out,
        v[0]!,
        v[1]!,
        (0.6 + 1.7 * depth) * (1 + 0.4 * crest) * rs,
        0.34 + 0.56 * depth + 0.1 * crest
      );
    }
  }
};
const drawComposing = (
  out: string[],
  size: number,
  t: number,
  p: Profile
): void => {
  const c = size / 2;
  const R = c * 0.78;
  const rs = radiusScale(size) * p.radius;
  const st = Math.sin(0.3);
  const ct = Math.cos(0.3);
  const v = [0, 0, 0];
  const shell = 70;
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < shell; i += 1) {
    const y = 1 - (2 * (i + 0.5)) / shell;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const a = i * golden;
    project(
      v,
      rad * Math.cos(a) * R,
      y * R,
      rad * Math.sin(a) * R,
      0,
      1,
      st,
      ct,
      c,
      c,
      1
    );
    const depth = (v[2]! / R + 1) / 2;
    dot(out, v[0]!, v[1]!, 0.8 * rs, 0.22 * (0.3 + 0.7 * depth));
  }
  const ta = 0.55;
  const ux = 1;
  const uz = 0;
  const vx = -uz * Math.sin(ta);
  const vy = Math.cos(ta);
  const vz = ux * Math.sin(ta);
  const nx = -uz * vy;
  const ny = uz * vx - ux * vz;
  const nz = ux * vy;
  const lanes = p.rows;
  const half = Math.max(1, (lanes - 1) / 2);
  for (let w = 0; w < lanes; w += 1) {
    const laneOffset = (w - (lanes - 1) / 2) * 0.075;
    const edge = Math.abs(w - (lanes - 1) / 2) / half;
    for (let k = 0; k < p.density; k += 1) {
      const a = (k / p.density) * 2 * Math.PI;
      const wobble =
        0.16 * Math.sin(a * 3 - t * 1.7 + w * 0.22) +
        0.07 * Math.sin(a * 5 + t * 1.1);
      const off = laneOffset + wobble;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const x = ux * ca + vx * sa + nx * off;
      const y = vy * sa + ny * off;
      const z = uz * ca + vz * sa + nz * off;
      const l = Math.max(1e-6, Math.hypot(x, y, z));
      project(v, (x / l) * R, (y / l) * R, (z / l) * R, 0, 1, st, ct, c, c, 1);
      const depth = (v[2]! / R + 1) / 2;
      dot(
        out,
        v[0]!,
        v[1]!,
        (1.1 + 1.7 * depth) * (1 - 0.25 * edge) * rs,
        (0.48 + 0.44 * depth - 0.18 * edge) * (0.4 + 0.6 * depth)
      );
    }
  }
};
const shapePoint = (out: number[], index: number, f: number): void => {
  const verts = SHAPES[index]!;
  if (!verts.length) {
    const a = -Math.PI / 2 + f * 2 * Math.PI;
    out[0] = Math.cos(a) * 0.24;
    out[1] = Math.sin(a) * 0.24;
    return;
  }
  const n = verts.length / 2;
  let total = 0;
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    total += Math.hypot(
      verts[j * 2]! - verts[i * 2]!,
      verts[j * 2 + 1]! - verts[i * 2 + 1]!
    );
  }
  let target = f * total;
  for (let i = 0; i < n; i += 1) {
    const j = (i + 1) % n;
    const ax = verts[i * 2]!;
    const ay = verts[i * 2 + 1]!;
    const bx = verts[j * 2]!;
    const by = verts[j * 2 + 1]!;
    const len = Math.hypot(bx - ax, by - ay);
    if (target <= len || i === n - 1) {
      const ff = len ? Math.min(1, target / len) : 0;
      out[0] = ax + (bx - ax) * ff;
      out[1] = ay + (by - ay) * ff;
      return;
    }
    target -= len;
  }
};
const drawShaping = (
  out: string[],
  size: number,
  t: number,
  p: Profile
): void => {
  const c = size / 2;
  const hold = 1.4;
  const morph = 0.9;
  const seg = hold + morph;
  const shapes = 3;
  const tc = t % (seg * shapes);
  const k = Math.floor(tc / seg);
  const local = tc - k * seg;
  const raw = local > hold ? (local - hold) / morph : 0;
  const m = raw * raw * (3 - 2 * raw);
  const spread = 1.45;
  const samples = 96;
  const px: number[] = [];
  const py: number[] = [];
  const a = [0, 0];
  const b = [0, 0];
  for (let i = 0; i < samples; i += 1) {
    const f = i / samples;
    shapePoint(a, k, f);
    shapePoint(b, (k + 1) % shapes, f);
    px.push((a[0]! + (b[0]! - a[0]!) * m) * spread);
    py.push((a[1]! + (b[1]! - a[1]!) * m) * spread);
  }
  const lengths: number[] = [];
  let total = 0;
  for (let i = 0; i < samples; i += 1) {
    const j = (i + 1) % samples;
    const l = Math.hypot(px[j]! - px[i]!, py[j]! - py[i]!);
    lengths.push(l);
    total += l;
  }
  const n = p.density;
  const r = Math.max(0.35, 0.021 * 1.35 * spread * size * p.radius * 0.4);
  const pulse = 1 + 0.02 * Math.sin(local * 3.1);
  let index = 0;
  let walked = 0;
  for (let i = 0; i < n; i += 1) {
    const target = (i / n) * total;
    while (walked + lengths[index]! < target && index < samples - 1) {
      walked += lengths[index]!;
      index += 1;
    }
    const j = (index + 1) % samples;
    const f = lengths[index]!
      ? Math.min(1, (target - walked) / lengths[index]!)
      : 0;
    const x = (px[index]! + (px[j]! - px[index]!) * f) * pulse;
    const y = (py[index]! + (py[j]! - py[index]!) * f) * pulse;
    dot(out, c + x * size, c + y * size, r, 0.92);
  }
};
export const renderFrame = (
  state: ThinkingOrbState,
  size: number,
  t: number,
  p: Profile
): string[] => {
  const out: string[] = [];
  for (let i = 0; i < BUCKETS; i += 1) {
    out.push("");
  }
  if (state === "working") {
    drawWorking(out, size, t, p);
  } else if (state === "searching") {
    drawSearching(out, size, t, p);
  } else if (state === "solving") {
    drawSolving(out, size, t, p);
  } else if (state === "listening") {
    drawListening(out, size, t, p);
  } else if (state === "composing") {
    drawComposing(out, size, t, p);
  } else {
    drawShaping(out, size, t, p);
  }
  return out;
};
