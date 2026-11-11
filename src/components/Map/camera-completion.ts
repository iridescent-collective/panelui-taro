import type { LngLat, LngLatBounds, ViewState } from "./types";

const CAMERA_SETTLE_INTERVAL = 48;
const CAMERA_SETTLE_TIMEOUT = 2000;

interface CameraCompletion {
  accept: (view: ViewState) => boolean;
  complete?: (view: ViewState) => void;
  isCurrent: () => boolean;
  read: (isCurrent: () => boolean) => Promise<ViewState | undefined>;
  timeout: () => void;
}
export const startCameraCompletion = (options: CameraCompletion) => {
  let active = true;
  let retry: ReturnType<typeof setTimeout> | undefined;
  const deadline: { timer?: ReturnType<typeof setTimeout> } = {};
  const isCurrent = () => active && options.isCurrent();
  const cancel = () => {
    active = false;
    clearTimeout(retry);
    clearTimeout(deadline.timer);
  };
  deadline.timer = setTimeout(() => {
    const current = isCurrent();
    cancel();
    if (current) {
      options.timeout();
    }
  }, CAMERA_SETTLE_TIMEOUT);
  const poll = async () => {
    if (!isCurrent()) {
      cancel();
      return;
    }
    let next: ViewState | undefined;
    try {
      next = await options.read(isCurrent);
    } catch {
      next = undefined;
    }
    if (!isCurrent()) {
      cancel();
      return;
    }
    if (next && options.accept(next)) {
      cancel();
      options.complete?.(next);
      return;
    }
    retry = setTimeout(() => {
      void poll();
    }, CAMERA_SETTLE_INTERVAL);
  };
  void poll();
  return cancel;
};
const angularDistance = (a: number, b: number) =>
  Math.abs(((((a - b + 180) % 360) + 360) % 360) - 180);
export const mapViewMatches = (
  next: ViewState,
  target: Pick<ViewState, "bearing" | "center" | "pitch" | "zoom">
) =>
  Math.abs(next.zoom - target.zoom) < 0.005 &&
  angularDistance(next.center[0], target.center[0]) < 0.00001 &&
  Math.abs(next.center[1] - target.center[1]) < 0.00001 &&
  angularDistance(next.bearing, target.bearing) < 0.01 &&
  Math.abs(next.pitch - target.pitch) < 0.01;
const longitudeSpan = (west: number, east: number) => {
  const span = (((east - west) % 360) + 360) % 360;
  return span === 0 && east !== west ? 360 : span;
};
const mercatorLatitude = (latitude: number) => {
  const bounded = Math.min(85.05112878, Math.max(-85.05112878, latitude));
  return Math.log(Math.tan(Math.PI / 4 + (bounded * Math.PI) / 360));
};
const unchangedCoordinate = (point: LngLat): LngLat => point;
export const stableMapBounds = (
  box: LngLatBounds,
  pixelSize: () => { width: number; height: number },
  toNative: (point: LngLat) => LngLat = unchangedCoordinate
) => {
  let previous: ViewState | undefined;
  let count = 0;
  const corners = [
    [box[0], box[1]],
    [box[0], box[3]],
    [box[2], box[1]],
    [box[2], box[3]],
  ].map((point) => toNative(point as LngLat));
  return (next: ViewState) => {
    const { height, width } = pixelSize();
    const southwest = toNative([next.bounds[0], next.bounds[1]]);
    const northeast = toNative([next.bounds[2], next.bounds[3]]);
    const span = longitudeSpan(southwest[0], northeast[0]);
    const top = mercatorLatitude(northeast[1]);
    const bottom = mercatorLatitude(southwest[1]);
    const contains =
      width > 0 &&
      height > 0 &&
      span > 0 &&
      top > bottom &&
      (longitudeSpan(box[0], box[2]) < 360 || span >= 360) &&
      corners.every(([longitude, latitude]) => {
        let offset = (((longitude - southwest[0]) % 360) + 360) % 360;
        if (360 - offset <= span / width) {
          offset -= 360;
        }
        const x = (offset / span) * width;
        const y =
          ((top - mercatorLatitude(latitude)) / (top - bottom)) * height;
        return (
          (span >= 360 || (x >= -1 && x <= width + 1)) &&
          y >= -1 &&
          y <= height + 1
        );
      });
    const prior = previous;
    const stable =
      prior &&
      mapViewMatches(next, prior) &&
      next.bounds.every(
        (value, index) => Math.abs(value - prior.bounds[index]) < 0.000001
      );
    if (contains) {
      count = stable ? count + 1 : 1;
    } else {
      count = 0;
    }
    previous = next;
    return count >= 3;
  };
};
