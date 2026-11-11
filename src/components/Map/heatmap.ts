import { rgbaColor } from "./expression";
import { featureProperties } from "./geojson";
import type { PixelPoint } from "./types";

export interface HeatPoint {
  point: PixelPoint;
  feature: unknown;
}
const interpolateStops = (zoom: number, stops: number[][], base = 1) => {
  if (zoom <= stops[0][0]) {
    return stops[0][1];
  }
  for (let i = 1; i < stops.length; i += 1) {
    const [high, to] = stops[i];
    const [low, from] = stops[i - 1];
    if (zoom <= high) {
      const fraction =
        base === 1
          ? (zoom - low) / (high - low)
          : (base ** (zoom - low) - 1) / (base ** (high - low) - 1);
      return from + (to - from) * fraction;
    }
  }
  return stops.at(-1)?.[1] ?? 0;
};
export const heatmapSettings = (
  zoom: number,
  radius: number,
  intensity: number,
  opacity: number,
  maxZoom: number
) => ({
  intensity: interpolateStops(zoom, [
    [0, intensity * 0.6],
    [maxZoom, intensity * 1.2],
  ]),
  opacity: interpolateStops(zoom, [
    [maxZoom - 2, opacity],
    [maxZoom, 0],
  ]),
  pointOpacity: interpolateStops(zoom, [
    [maxZoom - 2, 0],
    [maxZoom, 0.85],
  ]),
  pointStrokeOpacity: interpolateStops(zoom, [
    [maxZoom - 2, 0],
    [maxZoom, 0.6],
  ]),
  radius: interpolateStops(
    zoom,
    [
      [0, Math.max(2, radius / 10)],
      [8, Math.max(6, radius / 1.8)],
      [14, radius],
    ],
    2
  ),
});
export const withAlpha = (color: string, alpha: number) => {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const full =
      hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex.slice(0, 6);
    const r = Number.parseInt(full.slice(0, 2), 16);
    const g = Number.parseInt(full.slice(2, 4), 16);
    const b = Number.parseInt(full.slice(4, 6), 16);
    if (Number.isNaN(r + g + b)) {
      return color;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const match = color.match(/rgba?\([^)]*\)/u)?.[0];
  const channels = match?.slice(match.indexOf("(") + 1, -1);
  if (channels) {
    const [r, g, b] = channels.split(",").map((part) => part.trim());
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};
export const heatmapRamp = (color: string, colors: unknown) =>
  Array.isArray(colors) && colors.length
    ? colors.filter((value): value is string => typeof value === "string")
    : [
        withAlpha(color, 0.25),
        withAlpha(color, 0.45),
        withAlpha(color, 0.7),
        withAlpha(color, 0.9),
        color,
      ];
export const heatColor = (density: number, ramp: string[]) => {
  const colors = [[0, 0, 0, 0] as readonly number[], ...ramp.map(rgbaColor)];
  const stops = [
    0,
    ...ramp.map(
      (_, index) => 0.15 + (0.85 * index) / Math.max(1, ramp.length - 1)
    ),
  ];
  const bounded = Math.min(1, Math.max(0, density));
  for (let index = 1; index < stops.length; index += 1) {
    if (bounded <= stops[index]) {
      const t =
        (bounded - stops[index - 1]) / (stops[index] - stops[index - 1]);
      return colors[index - 1].map(
        (channel, i) => channel + (colors[index][i] - channel) * t
      );
    }
  }
  return colors.at(-1) ?? [0, 0, 0, 0];
};
export const heatmapPixels = (
  width: number,
  height: number,
  points: HeatPoint[],
  options: {
    radius: number;
    intensity: number;
    opacity: number;
    ramp: string[];
    weight?: string;
  }
) => {
  const field = new Float32Array(width * height);
  const radius = Math.max(1, options.radius);
  const radiusSquared = radius * radius;
  for (const value of points) {
    const properties = featureProperties(value.feature);
    const weight = options.weight
      ? Math.min(1, Math.max(0, Number(properties[options.weight]) || 0))
      : 1;
    const [x, y] = value.point;
    const minX = Math.max(0, Math.floor(x - radius));
    const maxX = Math.min(width - 1, Math.ceil(x + radius));
    const minY = Math.max(0, Math.floor(y - radius));
    const maxY = Math.min(height - 1, Math.ceil(y + radius));
    for (let py = minY; py <= maxY; py += 1) {
      for (let px = minX; px <= maxX; px += 1) {
        const distance = (px - x) ** 2 + (py - y) ** 2;
        if (distance <= radiusSquared) {
          field[py * width + px] +=
            Math.exp((-distance / radiusSquared) * 4.5) *
            weight *
            options.intensity;
        }
      }
    }
  }
  const pixels = new Uint8ClampedArray(width * height * 4);
  const table = Array.from({ length: 256 }, (_, index) =>
    heatColor(index / 255, options.ramp)
  );
  for (let index = 0; index < field.length; index += 1) {
    const color = table[Math.min(255, Math.round(field[index] * 255))];
    const [r, g, b, a] = color;
    pixels[index * 4] = r;
    pixels[index * 4 + 1] = g;
    pixels[index * 4 + 2] = b;
    pixels[index * 4 + 3] = a * 255 * options.opacity;
  }
  return pixels;
};
