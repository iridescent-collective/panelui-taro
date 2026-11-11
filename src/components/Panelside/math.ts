import {
  COMMIT_DISTANCE,
  COMMIT_VELOCITY,
  MIN_OFFSET,
  GAP,
  PARALLAX,
  HIDDEN_EPSILON,
} from "./constants";

export const panelsideOffset = (
  translation: number,
  change: number,
  sign: number,
  extent: number
) => Math.min(Math.max(translation + change * sign, 0), extent);
export const panelsideRelease = (
  translation: number,
  velocity: number,
  sign: number,
  open: boolean
) => {
  const distance = translation * sign;
  const speed = velocity * sign;
  const decisive =
    (Math.abs(distance) > MIN_OFFSET && Math.abs(speed) > COMMIT_VELOCITY) ||
    Math.abs(distance) > COMMIT_DISTANCE;
  return decisive ? (speed === 0 ? distance : speed) > 0 : open;
};
export const panelsideScene = (
  progress: number,
  pushes: boolean,
  scale: number,
  width: number,
  sceneWidth: number,
  sign: number,
  radius: number
) => {
  const p = pushes ? progress : 0;
  const s = 1 - (1 - scale) * p;
  return {
    radius: p * radius,
    scale: s,
    x: sign * (p * (width + GAP) - (sceneWidth * (1 - s)) / 2),
  };
};
export const panelsidePanel = (
  progress: number,
  docked: boolean,
  overlay: boolean,
  width: number
) => {
  const p = docked ? 1 : progress;
  return {
    hidden: !docked && progress < 1 - HIDDEN_EPSILON,
    x: -(1 - p) * (overlay ? width : width * PARALLAX),
  };
};
export const panelsideWidth = (
  container: number,
  requested: number | undefined,
  docked: boolean
) =>
  requested ??
  (docked ? Math.min(container * 0.32, 320) : Math.min(container * 0.8, 360));
export const panelsideSpringVelocity = (
  position: number,
  target: number,
  velocity: number | undefined
) =>
  velocity !== undefined &&
  ((target > position && velocity > 0) || (target < position && velocity < 0))
    ? velocity
    : 0;

export const panelsideBackEnabled = (
  open: boolean,
  dismissible: boolean,
  docked: boolean
) => open && dismissible && !docked;
