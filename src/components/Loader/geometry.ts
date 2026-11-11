import { easeInOutQuad } from "../../lib/easing";
import { GEOMETRY } from "./constants";

export const q = (value: number) => Math.round(value * 10) / 10;
export const circle = (cx: number, cy: number, r: number) =>
  `M${q(cx - r)},${q(cy)}A${q(r)},${q(r)} 0 1 0 ${q(cx + r)},${q(cy)}A${q(r)},${q(r)} 0 1 0 ${q(cx - r)},${q(cy)}Z`;
export const repeatValue = (
  elapsed: number,
  delay: number,
  duration: number,
  from: number,
  to: number
) => {
  if (elapsed <= delay) {
    return from;
  }
  const phase = (elapsed - delay) / duration;
  const fraction = phase % 1;
  const progress = Math.floor(phase) % 2 === 0 ? fraction : 1 - fraction;
  return from + (to - from) * easeInOutQuad(progress);
};
export const liquidGeometry = (scale: number, t: number) => {
  const g = GEOMETRY["liquid-dots"];
  const r = g.radius * scale;
  const width = g.width * scale;
  const height = g.height * scale;
  const cy = height / 2;
  const mid = width / 2;
  const x1 = mid + t * g.travel * scale;
  const x2 = mid - t * g.travel * scale;
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const gap = right - left;
  let path = circle(left, cy, r) + circle(right, cy, r);
  const pull = Math.max(0, 1 - gap / (r * 2.2));
  const half = r * pull * pull * 0.95;
  if (half > r * 0.12 && gap > 1) {
    const waist = half * 0.55;
    path += `M${q(left)},${q(cy - half)}Q${q((left + right) / 2)},${q(cy - waist)} ${q(right)},${q(cy - half)}L${q(right)},${q(cy + half)}Q${q((left + right) / 2)},${q(cy + waist)} ${q(left)},${q(cy + half)}Z`;
  }
  return { height, path, width };
};
export const ballAt = (time: number) => {
  const cycle = time % 2;
  const across = cycle < 1 ? cycle : 2 - cycle;
  const index = across * 14;
  let phase = (across * 4) % 1;
  if (across === 0 || across === 1) {
    phase = 0;
  }
  return { index, lift: 4 * phase * (1 - phase) };
};
export const waveGeometry = (scale: number, time: number, animate: boolean) => {
  const g = GEOMETRY["wave-physics"];
  const barWidth = g.bar * scale;
  const step = (g.bar + g.gap) * scale;
  const base = g.base * scale;
  const peak = g.peak * scale;
  const ballR = g.bar * 1.1 * scale;
  const bounce = peak * 0.9;
  const width = (g.count - 1) * step + barWidth;
  const height = base + peak + bounce + ballR * 2;
  const floor = height;
  const { index, lift } = animate ? ballAt(time) : { index: 7, lift: 0.5 };
  const press = Math.max(0, 1 - lift * 2);
  let path = "";
  for (let i = 0; i < g.count; i += 1) {
    const distance = Math.abs(i - index);
    const crest = distance < 3 ? Math.cos(((distance / 3) * Math.PI) / 2) : 0;
    const dent =
      distance < 1.5
        ? Math.cos(((distance / 1.5) * Math.PI) / 2) * press * peak * 0.5
        : 0;
    const barHeight = Math.max(base * 0.5, base + crest * peak - dent);
    const x = q(barWidth / 2 + i * step);
    path += `M${x},${q(floor)}L${x},${q(floor - barHeight)}`;
  }
  const rest = base + peak - press * peak * 0.5;
  return {
    ball: {
      cx: q(barWidth / 2 + index * step),
      cy: q(floor - rest - ballR + press * ballR * 0.3 - lift * bounce),
      rx: q(ballR * (1 + press * 0.25)),
      ry: q(ballR * (1 - press * 0.28)),
    },
    barWidth,
    height,
    path,
    width,
  };
};
