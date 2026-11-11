import type { ErrorCorrectionLevel } from "./qr-encode";
import type { QRCodeSize } from "./types";

export const CANVAS_SIZE: Record<QRCodeSize, number> = {
  lg: 240,
  md: 180,
  sm: 128,
};
export const QUIET_ZONE = 4;
export const LOGO_FRACTION = 0.25;
export const PLATE = "#ffffff";
export const MODULE = "#111111";
const TOLERANCE: Record<ErrorCorrectionLevel, number> = {
  H: 0.3,
  L: 0.07,
  M: 0.15,
  Q: 0.25,
};
const LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];
export const holeBounds = (matrixSize: number, logoFraction: number) => ({
  from: Math.floor((matrixSize * (1 - logoFraction)) / 2),
  to: Math.ceil((matrixSize * (1 + logoFraction)) / 2),
});
export const levelFor = (
  requested: ErrorCorrectionLevel,
  logoFraction: number
): ErrorCorrectionLevel => {
  const needed = logoFraction * logoFraction;
  const affordable = (level: ErrorCorrectionLevel) =>
    TOLERANCE[level] / 2 >= needed;
  if (affordable(requested)) {
    return requested;
  }
  return LEVELS.slice(LEVELS.indexOf(requested)).find(affordable) ?? "H";
};
