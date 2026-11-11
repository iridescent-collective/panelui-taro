import { holeBounds, levelFor } from "./constants";
import { encodeQr } from "./qr-encode";
import type { ErrorCorrectionLevel, QrMatrix } from "./qr-encode";

export const encodeWithLogo = (
  value: string,
  requested: ErrorCorrectionLevel,
  version: number | undefined,
  fraction: number
): QrMatrix => {
  let level = levelFor(requested, fraction);
  let matrix = encodeQr(value, { errorCorrection: level, version });
  if (!fraction) {
    return matrix;
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { from, to } = holeBounds(matrix.size, fraction);
    const actualFraction = (to - from) / matrix.size;
    const next = levelFor(level, actualFraction);
    if (next === level) {
      return matrix;
    }
    level = next;
    matrix = encodeQr(value, { errorCorrection: level, version });
  }
  return matrix;
};
