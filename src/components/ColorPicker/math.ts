export const trackFraction = (
  x: number,
  width: number,
  thumbSize: number,
  sign: number
) => {
  const along = sign === 1 ? x : width - x;
  const travel = Math.max(width - thumbSize, 1);
  return Math.min(Math.max((along - thumbSize / 2) / travel, 0), 1);
};
export const areaColor = (
  x: number,
  y: number,
  width: number,
  height: number,
  sign: number
) => {
  const w = Math.max(width, 1);
  const along = sign === 1 ? x : w - x;
  return {
    s: Math.min(Math.max(along / w, 0), 1),
    v: 1 - Math.min(Math.max(y / height, 0), 1),
  };
};
export const wheelColor = (x: number, y: number, radius: number) => {
  const dx = x - radius;
  const dy = y - radius;
  const degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
  return {
    h: (degrees + 360) % 360,
    s: Math.min(Math.hypot(dx, dy) / radius, 1),
  };
};
