import type { LngLat } from "./types";

export const arcCoordinates = (
  from: LngLat,
  to: LngLat,
  curvature = 0.2
): LngLat[] => {
  const [x1, y1] = from;
  const [x2, y2] = to;
  const controlX = (x1 + x2) / 2 - (y2 - y1) * curvature;
  const controlY = (y1 + y2) / 2 + (x2 - x1) * curvature;
  const coordinates: LngLat[] = [];
  for (let i = 0; i <= 64; i += 1) {
    const t = i / 64;
    const inv = 1 - t;
    coordinates.push([
      inv * inv * x1 + 2 * inv * t * controlX + t * t * x2,
      inv * inv * y1 + 2 * inv * t * controlY + t * t * y2,
    ]);
  }
  return coordinates;
};
