export type SeriesColorIndex = 1 | 2 | 3 | 4 | 5;
const MAGNITUDES = ["k", "M", "B", "T"] as const;
const trimZeros = (text: string): string =>
  text.includes(".") ? text.replace(/\.?0+$/u, "") : text;
const mantissa = (value: number): string =>
  trimZeros(value.toFixed(Math.abs(value) < 10 ? 1 : 0));
export const compactNumber = (value: number): string => {
  if (!Number.isFinite(value)) {
    return String(value);
  }
  const abs = Math.abs(value);
  if (abs < 1000) {
    if (Number.isInteger(value)) {
      return String(value);
    }
    return trimZeros(value.toFixed(abs < 1 ? 2 : 1));
  }
  let index = 0;
  let scaled = value / 1000;
  while (Math.abs(scaled) >= 1000 && index < MAGNITUDES.length - 1) {
    scaled /= 1000;
    index += 1;
  }
  let text = mantissa(scaled);
  if (Math.abs(Number(text)) >= 1000 && index < MAGNITUDES.length - 1) {
    index += 1;
    text = mantissa(scaled / 1000);
  }
  return `${text}${MAGNITUDES[index]}`;
};
export interface Plot {
  width: number;
  height: number;
  left: number;
  top: number;
}
export const xOf = (index: number, total: number, plot: Plot): number => {
  if (total <= 1) {
    return plot.left + plot.width / 2;
  }
  return plot.left + (plot.width * index) / (total - 1);
};
export const yOf = (
  value: number,
  plot: Plot,
  min: number,
  max: number
): number => {
  const span = max - min || 1;
  return plot.top + plot.height - ((value - min) / span) * plot.height;
};
export const bandOf = (index: number, total: number, plot: Plot): number => {
  if (total <= 0) {
    return plot.left + plot.width / 2;
  }
  const width = plot.width / total;
  return plot.left + width * (index + 0.5);
};
export const tangents = (xs: number[], ys: number[]): number[] => {
  const n = xs.length;
  const slopes: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    slopes.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i] || 1));
  }
  const result: number[] = Array.from({ length: n }, () => 0);
  result[0] = slopes[0] ?? 0;
  result[n - 1] = slopes[n - 2] ?? 0;
  for (let i = 1; i < n - 1; i += 1) {
    const previous = slopes[i - 1];
    const next = slopes[i];
    result[i] = previous * next <= 0 ? 0 : (previous + next) / 2;
  }
  for (let i = 0; i < n - 1; i += 1) {
    const slope = slopes[i];
    if (slope === 0) {
      result[i] = 0;
      result[i + 1] = 0;
      continue;
    }
    const a = result[i] / slope;
    const b = result[i + 1] / slope;
    const magnitude = Math.sqrt(a * a + b * b);
    if (magnitude > 3) {
      result[i] = (3 / magnitude) * a * slope;
      result[i + 1] = (3 / magnitude) * b * slope;
    }
  }
  return result;
};
export type ChartCurve = "monotone" | "linear";
export interface ChartPoint {
  x: number;
  y: number;
}
export const runsOf = (
  values: (number | null)[],
  plot: Plot,
  min: number,
  max: number,
  baselines?: number[],
  banded?: boolean
): ChartPoint[][] => {
  const runs: ChartPoint[][] = [];
  let run: ChartPoint[] = [];
  for (let i = 0; i < values.length; i += 1) {
    const value = values[i];
    if (value === null || value === undefined) {
      if (run.length) {
        runs.push(run);
      }
      run = [];
      continue;
    }
    const stacked = value + (baselines?.[i] ?? 0);
    const x = banded
      ? bandOf(i, values.length, plot)
      : xOf(i, values.length, plot);
    run.push({ x, y: yOf(stacked, plot, min, max) });
  }
  if (run.length) {
    runs.push(run);
  }
  return runs;
};
export const segment = (points: ChartPoint[], curve: ChartCurve): string => {
  if (!points.length) {
    return "";
  }
  if (points.length < 3 || curve === "linear") {
    return points
      .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
      .join(" ");
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const ms = tangents(xs, ys);
  let d = `M${xs[0]},${ys[0]}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const dx = (xs[i + 1] - xs[i]) / 3;
    d += ` C${xs[i] + dx},${ys[i] + ms[i] * dx} ${xs[i + 1] - dx},${ys[i + 1] - ms[i + 1] * dx} ${xs[i + 1]},${ys[i + 1]}`;
  }
  return d;
};
export const linePath = (
  values: (number | null)[],
  plot: Plot,
  min: number,
  max: number,
  curve: ChartCurve,
  loading: boolean,
  baselines?: number[],
  banded?: boolean
): string => {
  if (loading || plot.width <= 0) {
    const y = plot.top + plot.height / 2;
    return `M${plot.left},${y} L${plot.left + plot.width},${y}`;
  }
  return runsOf(values, plot, min, max, baselines, banded)
    .map((run) => segment(run, curve))
    .join(" ");
};
export const areaPath = (
  values: (number | null)[],
  plot: Plot,
  min: number,
  max: number,
  curve: ChartCurve,
  loading: boolean,
  baselines?: number[],
  banded?: boolean
): string => {
  if (loading || plot.width <= 0) {
    return "";
  }
  const bottom = plot.top + plot.height;
  const runs = runsOf(values, plot, min, max, baselines, banded);
  if (!baselines) {
    return runs
      .map((run) => {
        const top = segment(run, curve);
        if (!top) {
          return "";
        }
        const [first] = run;
        const last = run.at(-1);
        if (!first || !last) {
          return "";
        }
        return `${top} L${last.x},${bottom} L${first.x},${bottom} Z`;
      })
      .join(" ");
  }
  const floors = runsOf(
    values.map((value) => (value === null || value === undefined ? null : 0)),
    plot,
    min,
    max,
    baselines,
    banded
  );
  return runs
    .map((run, index) => {
      const top = segment(run, curve);
      const floor = floors[index];
      if (!top || !floor?.length) {
        return "";
      }
      const under = segment(
        Array.from(
          { length: floor.length },
          (_unused, floorIndex) => floor[floor.length - floorIndex - 1]
        ),
        curve
      ).replace("M", "L");
      return `${top} ${under} Z`;
    })
    .join(" ");
};
export const columnValues = (
  data: Record<string, unknown>[],
  key: string
): (number | null)[] =>
  data.map((row) => {
    const value = row[key];
    return typeof value === "number" && Number.isFinite(value) ? value : null;
  });

export const barPath = (
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  towards: "up" | "down" | "left" | "right"
): string => {
  if (width <= 0 || height <= 0) {
    return "";
  }
  const r = Math.max(0, Math.min(radius, width / 2, height / 2));
  const right = x + width;
  const bottom = y + height;
  if (towards === "up") {
    return (
      `M${x},${bottom}L${x},${y + r}Q${x},${y} ${x + r},${y}` +
      `L${right - r},${y}Q${right},${y} ${right},${y + r}L${right},${bottom}Z`
    );
  }
  if (towards === "down") {
    return (
      `M${x},${y}L${x},${bottom - r}Q${x},${bottom} ${x + r},${bottom}` +
      `L${right - r},${bottom}Q${right},${bottom} ${right},${bottom - r}L${right},${y}Z`
    );
  }
  if (towards === "right") {
    return (
      `M${x},${y}L${right - r},${y}Q${right},${y} ${right},${y + r}` +
      `L${right},${bottom - r}Q${right},${bottom} ${right - r},${bottom}L${x},${bottom}Z`
    );
  }
  return (
    `M${right},${y}L${x + r},${y}Q${x},${y} ${x},${y + r}` +
    `L${x},${bottom - r}Q${x},${bottom} ${x + r},${bottom}L${right},${bottom}Z`
  );
};

export const wedgePath = (
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  from: number,
  to: number,
  corner: number
): string => {
  const sweep = to - from;
  if (outer <= 0 || sweep <= 0) {
    return "";
  }
  const at = (turn: number, radius: number) => {
    const angle = (turn - 0.25) * Math.PI * 2;
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  };
  const ring = Math.max(0, Math.min(inner, outer));
  if (sweep >= 1) {
    const disc =
      `M${at(0, outer)}A${outer},${outer} 0 1 1 ${at(0.5, outer)}` +
      `A${outer},${outer} 0 1 1 ${at(0, outer)}Z`;
    if (ring <= 0) {
      return disc;
    }
    return (
      `${disc}M${at(0, ring)}A${ring},${ring} 0 1 0 ${at(0.5, ring)}` +
      `A${ring},${ring} 0 1 0 ${at(0, ring)}Z`
    );
  }
  const band = ring > 0 ? outer - ring : outer;
  const k = Math.max(0, Math.min(corner, band / 2, sweep * outer * Math.PI));
  const outerInset = Math.min(k / (outer * Math.PI * 2), sweep / 2);
  const innerInset =
    ring > 0 ? Math.min(k / (ring * Math.PI * 2), sweep / 2) : 0;
  const large = sweep - 2 * outerInset > 0.5 ? 1 : 0;
  const outerStart = from + outerInset;
  const outerEnd = to - outerInset;
  if (ring <= 0) {
    return (
      `M${cx},${cy}L${at(from, outer - k)}Q${at(from, outer)} ${at(outerStart, outer)}` +
      `A${outer},${outer} 0 ${large} 1 ${at(outerEnd, outer)}` +
      `Q${at(to, outer)} ${at(to, outer - k)}Z`
    );
  }
  return (
    `M${at(outerStart, outer)}A${outer},${outer} 0 ${large} 1 ${at(outerEnd, outer)}` +
    `Q${at(to, outer)} ${at(to, outer - k)}` +
    `L${at(to, ring + k)}` +
    `Q${at(to, ring)} ${at(to - innerInset, ring)}` +
    `A${ring},${ring} 0 ${large} 0 ${at(from + innerInset, ring)}` +
    `Q${at(from, ring)} ${at(from, ring + k)}` +
    `L${at(from, outer - k)}` +
    `Q${at(from, outer)} ${at(outerStart, outer)}Z`
  );
};

export const polarPoint = (
  cx: number,
  cy: number,
  radius: number,
  turn: number
): {
  x: number;
  y: number;
} => {
  "worklet";
  const angle = (turn - 0.25) * Math.PI * 2;
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
};

export const radarPath = (
  values: (number | null)[],
  cx: number,
  cy: number,
  radius: number
): string => {
  const count = values.length;
  if (count < 3 || radius <= 0) {
    return "";
  }
  let path = "";
  let drawn = 0;
  for (let index = 0; index < count; index += 1) {
    const value = values[index];
    if (value === null || value === undefined) {
      continue;
    }
    const point = polarPoint(cx, cy, radius * value, index / count);
    path += `${drawn === 0 ? "M" : "L"}${point.x},${point.y}`;
    drawn += 1;
  }
  if (drawn < 3) {
    return "";
  }
  return `${path}Z`;
};
