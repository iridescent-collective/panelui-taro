import type { LngLat, PixelPoint } from "./types";

export interface NativeMapProjectionFrame {
  region: {
    southwest: { longitude: number; latitude: number };
    northeast: { longitude: number; latitude: number };
  };
  bearing: number;
  pitch: number;
}
const mercatorLatitude = (latitude: number) => {
  const radians =
    (Math.min(85.05112878, Math.max(-85.05112878, latitude)) * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + radians / 2));
};
export const projectMapRegion = (
  point: LngLat,
  frame: NativeMapProjectionFrame,
  width: number,
  height: number
): PixelPoint => {
  const { southwest, northeast } = frame.region;
  const values = [
    ...point,
    southwest.longitude,
    southwest.latitude,
    northeast.longitude,
    northeast.latitude,
    width,
    height,
    frame.bearing,
    frame.pitch,
  ];
  if (
    values.some((value) => !Number.isFinite(value)) ||
    width <= 0 ||
    height <= 0
  ) {
    throw new RangeError(
      "Map: region projection requires a finite measured map"
    );
  }
  if (Math.abs(frame.bearing % 360) > 0.01 || Math.abs(frame.pitch) > 0.01) {
    throw new Error(
      "Map: simulator region projection supports only an unrotated, untilted map"
    );
  }
  let span = northeast.longitude - southwest.longitude;
  if (span < 0) {
    span += 360;
  }
  const top = mercatorLatitude(northeast.latitude);
  const bottom = mercatorLatitude(southwest.latitude);
  if (span <= 0 || top <= bottom) {
    throw new RangeError("Map: native region must have a positive extent");
  }
  const center = southwest.longitude + span / 2;
  const longitude =
    center + ((((point[0] - center + 180) % 360) + 360) % 360) - 180;
  return [
    ((longitude - southwest.longitude) / span) * width,
    ((top - mercatorLatitude(point[1])) / (top - bottom)) * height,
  ];
};
