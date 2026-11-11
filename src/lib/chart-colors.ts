const FALLBACK_SERIES = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
const channelsOf = (color: string): [number, number, number] | null => {
  const value = color.trim().toLowerCase();
  if (value.startsWith("#")) {
    const body =
      value.length === 4 || value.length === 5
        ? value.slice(1, 4).replaceAll(/./gu, "$&$&")
        : value.slice(1, 7);
    if (body.length !== 6 || /[^0-9a-f]/u.test(body)) {
      return null;
    }
    return [
      Number.parseInt(body.slice(0, 2), 16),
      Number.parseInt(body.slice(2, 4), 16),
      Number.parseInt(body.slice(4, 6), 16),
    ];
  }
  const matchesRgb = /^rgba?\([^)]+\)$/u.test(value);
  if (!matchesRgb) {
    return null;
  }
  const parts = value
    .slice(value.indexOf("(") + 1, -1)
    .split(/[\s,/]+/u)
    .filter(Boolean);
  if (parts.length < 3) {
    return null;
  }
  const channels = parts.slice(0, 3).map((raw) => {
    const n = Number.parseFloat(raw);
    if (Number.isNaN(n)) {
      return null;
    }
    return raw.endsWith("%") ? (n / 100) * 255 : n;
  });
  return channels.some((c) => c === null)
    ? null
    : (channels as [number, number, number]);
};
const linear = (value: number): number => {
  const c = Math.min(1, Math.max(0, value / 255));
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const luminanceOf = (rgb: [number, number, number]): number =>
  0.2126 * linear(rgb[0]) + 0.7152 * linear(rgb[1]) + 0.0722 * linear(rgb[2]);
export interface ChartInk {
  color: string;
  muted: string;
}
const LIGHT_INK: ChartInk = {
  color: "#ffffff",
  muted: "rgba(255,255,255,0.82)",
};
const DARK_INK: ChartInk = { color: "#0a0a0a", muted: "rgba(10,10,10,0.82)" };
const INK_FLOOR = 3;
const tone = (color: string, amount: number): string => {
  const rgb = channelsOf(color);
  if (!rgb) {
    return color;
  }
  const target = amount >= 0 ? 255 : 0;
  const t = Math.min(Math.abs(amount), 0.85);
  const [r, g, b] = rgb.map((c) => Math.round(c + (target - c) * t));
  return `rgb(${r}, ${g}, ${b})`;
};
export const seriesColorAt = (palette: string[], index: number): string => {
  if (!palette.length) {
    return FALLBACK_SERIES[0];
  }
  const base = palette[index % palette.length] ?? FALLBACK_SERIES[0];
  const lap = Math.floor(index / palette.length);
  if (lap <= 0) {
    return base;
  }
  const rgb = channelsOf(base);
  const away = rgb && luminanceOf(rgb) > 0.4 ? -1 : 1;
  return tone(base, away * (1 - 0.66 ** lap));
};
export const inkOn = (fill: string, behind?: string, opacity = 1): ChartInk => {
  const front = channelsOf(fill);
  if (!front) {
    return LIGHT_INK;
  }
  const alpha = Math.min(1, Math.max(0, opacity));
  const ground = alpha < 1 && behind ? channelsOf(behind) : null;
  const seen: [number, number, number] = ground
    ? [
        alpha * front[0] + (1 - alpha) * ground[0],
        alpha * front[1] + (1 - alpha) * ground[1],
        alpha * front[2] + (1 - alpha) * ground[2],
      ]
    : front;
  return 1.05 / (luminanceOf(seen) + 0.05) >= INK_FLOOR ? LIGHT_INK : DARK_INK;
};
