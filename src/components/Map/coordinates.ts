import type { LngLat } from "./types";

const EARTH_AXIS = 6_378_245;
const ECCENTRICITY_SQUARED = 0.006693421622965943;
const outsideChina = ([lng, lat]: LngLat) =>
  lng < 72.004 || lng > 137.8347 || lat < 0.8293 || lat > 55.8271;
const latitudeOffset = (x: number, y: number) =>
  -100 +
  2 * x +
  3 * y +
  0.2 * y * y +
  0.1 * x * y +
  0.2 * Math.sqrt(Math.abs(x)) +
  ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3 +
  ((20 * Math.sin(y * Math.PI) + 40 * Math.sin((y / 3) * Math.PI)) * 2) / 3 +
  ((160 * Math.sin((y / 12) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30)) *
    2) /
    3;
const longitudeOffset = (x: number, y: number) =>
  300 +
  x +
  2 * y +
  0.1 * x * x +
  0.1 * x * y +
  0.1 * Math.sqrt(Math.abs(x)) +
  ((20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2) / 3 +
  ((20 * Math.sin(x * Math.PI) + 40 * Math.sin((x / 3) * Math.PI)) * 2) / 3 +
  ((150 * Math.sin((x / 12) * Math.PI) + 300 * Math.sin((x / 30) * Math.PI)) *
    2) /
    3;
export const wgs84ToGcj02 = (point: LngLat): LngLat => {
  if (outsideChina(point)) {
    return [...point];
  }
  const [lng, lat] = point;
  const radians = (lat / 180) * Math.PI;
  const sin = Math.sin(radians);
  const magic = 1 - ECCENTRICITY_SQUARED * sin * sin;
  const square = Math.sqrt(magic);
  const dLat =
    (latitudeOffset(lng - 105, lat - 35) * 180) /
    (((EARTH_AXIS * (1 - ECCENTRICITY_SQUARED)) / (magic * square)) * Math.PI);
  const dLng =
    (longitudeOffset(lng - 105, lat - 35) * 180) /
    ((EARTH_AXIS / square) * Math.cos(radians) * Math.PI);
  return [lng + dLng, lat + dLat];
};
export const gcj02ToWgs84 = (point: LngLat): LngLat => {
  if (outsideChina(point)) {
    return [...point];
  }
  let candidate: LngLat = [...point];
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const transformed = wgs84ToGcj02(candidate);
    const dx = transformed[0] - point[0];
    const dy = transformed[1] - point[1];
    candidate = [candidate[0] - dx, candidate[1] - dy];
    if (Math.abs(dx) + Math.abs(dy) < 1e-9) {
      break;
    }
  }
  return candidate;
};
export const validLngLat = (value: unknown): value is LngLat =>
  Array.isArray(value) &&
  value.length >= 2 &&
  typeof value[0] === "number" &&
  typeof value[1] === "number" &&
  Number.isFinite(value[0]) &&
  Number.isFinite(value[1]) &&
  Math.abs(value[0]) <= 180 &&
  Math.abs(value[1]) <= 90;
