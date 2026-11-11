export type CropShape = "circle" | "squircle" | "square";
export interface Size {
  width: number;
  height: number;
}
export interface CropState {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}
export interface CropFrame {
  mask: number;
  image: Size;
}
export interface SourceCrop {
  originX: number;
  originY: number;
  width: number;
  height: number;
  rotation: number;
  canvas: Size;
}
export const IDENTITY: CropState = { rotation: 0, scale: 1, x: 0, y: 0 };
const RUBBER_BAND = 0.55;
const EPSILON = 1e-9;
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);
const trig = (
  degrees: number
): {
  cos: number;
  sin: number;
} => {
  const radians = (degrees * Math.PI) / 180;
  let cos = Math.cos(radians);
  let sin = Math.sin(radians);
  if (Math.abs(cos) < EPSILON) {
    cos = 0;
  }
  if (Math.abs(sin) < EPSILON) {
    sin = 0;
  }
  return { cos, sin };
};
export const normalizeDegrees = (degrees: number): number => {
  let folded = degrees % 360;
  if (folded <= -180) {
    folded += 360;
  }
  if (folded > 180) {
    folded -= 360;
  }
  return folded;
};
export const baseSize = (source: Size, mask: number): Size => {
  const shortSide = Math.min(source.width, source.height);
  if (shortSide <= 0 || mask <= 0) {
    return { height: mask, width: mask };
  }
  const factor = mask / shortSide;
  return { height: source.height * factor, width: source.width * factor };
};
export const maskReach = (
  shape: CropShape,
  mask: number,
  rotation: number
): number => {
  const half = mask / 2;
  if (shape === "circle") {
    return half;
  }
  const { cos, sin } = trig(rotation);
  return half * (Math.abs(cos) + Math.abs(sin));
};
export interface CropBounds {
  shape: CropShape;
  maxZoom: number;
  cover: boolean;
  minZoom: number;
}
export const minScale = (
  bounds: CropBounds,
  frame: CropFrame,
  rotation: number
): number => {
  const covering = maskReach(bounds.shape, 2, rotation);
  if (bounds.cover) {
    return covering;
  }
  const longSide = Math.max(frame.image.width, frame.image.height);
  if (longSide <= 0) {
    return covering;
  }
  return Math.min(covering, (bounds.minZoom * frame.mask) / longSide);
};
const toImageAxes = (
  x: number,
  y: number,
  rotation: number
): {
  u: number;
  v: number;
} => {
  const { cos, sin } = trig(rotation);
  return { u: cos * x + sin * y, v: -sin * x + cos * y };
};
const fromImageAxes = (
  u: number,
  v: number,
  rotation: number
): {
  x: number;
  y: number;
} => {
  const { cos, sin } = trig(rotation);
  return { x: cos * u - sin * v, y: sin * u + cos * v };
};
const travel = (
  state: CropState,
  bounds: CropBounds,
  frame: CropFrame
): {
  u: number;
  v: number;
} => {
  const reach = maskReach(bounds.shape, frame.mask, state.rotation);
  const u = (state.scale * frame.image.width) / 2 - reach;
  const v = (state.scale * frame.image.height) / 2 - reach;
  return bounds.cover
    ? { u: Math.max(0, u), v: Math.max(0, v) }
    : { u: Math.abs(u), v: Math.abs(v) };
};
export const clampTranslation = (
  state: CropState,
  bounds: CropBounds,
  frame: CropFrame
): {
  x: number;
  y: number;
} => {
  const limit = travel(state, bounds, frame);
  const along = toImageAxes(state.x, state.y, state.rotation);
  return fromImageAxes(
    clamp(along.u, -limit.u, limit.u),
    clamp(along.v, -limit.v, limit.v),
    state.rotation
  );
};
export const settle = (
  state: CropState,
  bounds: CropBounds,
  frame: CropFrame
): CropState => {
  const lowest = minScale(bounds, frame, state.rotation);
  const scale = clamp(state.scale, lowest, Math.max(lowest, bounds.maxZoom));
  const next = { ...state, scale };
  return { ...next, ...clampTranslation(next, bounds, frame) };
};
export const coversMask = (
  state: CropState,
  shape: CropShape,
  frame: CropFrame
): boolean => {
  const reach = maskReach(shape, frame.mask, state.rotation);
  const along = toImageAxes(state.x, state.y, state.rotation);
  const slack = 0.5;
  return (
    Math.abs(along.u) <=
      (state.scale * frame.image.width) / 2 - reach + slack &&
    Math.abs(along.v) <= (state.scale * frame.image.height) / 2 - reach + slack
  );
};
export const rubberBand = (overshoot: number, dimension: number): number => {
  if (dimension <= 0) {
    return 0;
  }
  const sign = overshoot < 0 ? -1 : 1;
  const distance = Math.abs(overshoot);
  return (
    sign * (1 - 1 / ((distance * RUBBER_BAND) / dimension + 1)) * dimension
  );
};
export const present = (
  state: CropState,
  bounds: CropBounds,
  frame: CropFrame
): CropState => {
  const lowest = minScale(bounds, frame, state.rotation);
  const highest = Math.max(lowest, bounds.maxZoom);
  let { scale } = state;
  if (scale < lowest) {
    scale = lowest - rubberBand(lowest - scale, lowest / 2);
  } else if (scale > highest) {
    scale = highest + rubberBand(scale - highest, highest / 2);
  }
  const next = { ...state, scale };
  const limit = travel(next, bounds, frame);
  const along = toImageAxes(state.x, state.y, state.rotation);
  const u = clamp(along.u, -limit.u, limit.u);
  const v = clamp(along.v, -limit.v, limit.v);
  const offset = fromImageAxes(
    u + rubberBand(along.u - u, frame.mask),
    v + rubberBand(along.v - v, frame.mask),
    state.rotation
  );
  return { ...next, ...offset };
};
export const zoomAbout = (
  state: CropState,
  factor: number,
  fx: number,
  fy: number
): CropState => ({
  ...state,
  scale: state.scale * factor,
  x: fx + (state.x - fx) * factor,
  y: fy + (state.y - fy) * factor,
});
export const rotateAbout = (
  state: CropState,
  degrees: number,
  ax: number,
  ay: number
): CropState => {
  const { cos, sin } = trig(degrees);
  const dx = state.x - ax;
  const dy = state.y - ay;
  return {
    ...state,
    rotation: state.rotation + degrees,
    x: ax + cos * dx - sin * dy,
    y: ay + sin * dx + cos * dy,
  };
};
export const nextQuarterTurn = (
  rotation: number,
  direction: 1 | -1
): number => {
  const quarters = rotation / 90;
  const nearest = Math.round(quarters);
  const onQuarter = Math.abs(quarters - nearest) < 1e-6;
  let base = nearest;
  if (!onQuarter) {
    base = direction > 0 ? Math.floor(quarters) : Math.ceil(quarters);
  }
  return (base + direction) * 90;
};
export const sourceCrop = (
  state: CropState,
  frame: CropFrame,
  source: Size,
  onImage = true
): SourceCrop => {
  const rotation = normalizeDegrees(state.rotation);
  const { cos, sin } = trig(rotation);
  const canvas = {
    height: Math.floor(
      Math.abs(source.width * sin) + Math.abs(source.height * cos) + 1e-6
    ),
    width: Math.floor(
      Math.abs(source.width * cos) + Math.abs(source.height * sin) + 1e-6
    ),
  };
  const pointsPerPixel = (frame.image.width / source.width) * state.scale;
  const full = Math.max(1, Math.floor(frame.mask / pointsPerPixel));
  const side = onImage
    ? Math.max(1, Math.min(full, canvas.width, canvas.height))
    : full;
  const centreX = canvas.width / 2 - state.x / pointsPerPixel;
  const centreY = canvas.height / 2 - state.y / pointsPerPixel;
  const originX = Math.round(centreX - side / 2);
  const originY = Math.round(centreY - side / 2);
  return {
    canvas,
    height: side,
    originX: onImage ? clamp(originX, 0, canvas.width - side) : originX,
    originY: onImage ? clamp(originY, 0, canvas.height - side) : originY,
    rotation,
    width: side,
  };
};
const SQUIRCLE_EXPONENT = 5;
const SQUIRCLE_STEPS = 128;
export const maskPath = (
  shape: CropShape,
  cx: number,
  cy: number,
  mask: number
): string => {
  const r = mask / 2;
  if (shape === "square") {
    return `M${cx - r} ${cy - r}H${cx + r}V${cy + r}H${cx - r}Z`;
  }
  if (shape === "circle") {
    return `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;
  }
  const exponent = 2 / SQUIRCLE_EXPONENT;
  let path = "";
  for (let step = 0; step < SQUIRCLE_STEPS; step += 1) {
    const t = (step / SQUIRCLE_STEPS) * Math.PI * 2;
    const cos = Math.cos(t);
    const sin = Math.sin(t);
    const x = cx + r * Math.sign(cos) * Math.abs(cos) ** exponent;
    const y = cy + r * Math.sign(sin) * Math.abs(sin) ** exponent;
    path += `${step === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${path}Z`;
};
