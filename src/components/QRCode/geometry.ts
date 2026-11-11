import { holeBounds, QUIET_ZONE } from "./constants";
import type { QrMatrix } from "./qr-encode";
import {
  eyeBallPath,
  eyeFramePath,
  finderOrigins,
  inFinder,
  modulePath,
} from "./qr-shapes";
import type {
  QRCodeModuleShape,
  QRCodeEyeFrameShape,
  QRCodeEyeBallShape,
} from "./qr-shapes";

export const qrPaths = (
  matrix: QrMatrix,
  logoFraction: number,
  moduleShape: QRCodeModuleShape,
  eyeFrameShape: QRCodeEyeFrameShape,
  eyeBallShape: QRCodeEyeBallShape
) => {
  const hole = logoFraction ? holeBounds(matrix.size, logoFraction) : null;
  const body: boolean[][] = [];
  for (let y = 0; y < matrix.size; y += 1) {
    const row: boolean[] = [];
    for (let x = 0; x < matrix.size; x += 1) {
      row.push(
        !!matrix.modules[y]?.[x] &&
          !inFinder(x, y, matrix.size) &&
          !(
            hole &&
            x >= hole.from &&
            x < hole.to &&
            y >= hole.from &&
            y < hole.to
          )
      );
    }
    body.push(row);
  }
  let path = "";
  for (let y = 0; y < matrix.size; y += 1) {
    for (let x = 0; x < matrix.size; x += 1) {
      if (body[y]?.[x]) {
        path += modulePath(moduleShape, body, x, y, matrix.size, QUIET_ZONE);
      }
    }
  }
  let frames = "";
  let balls = "";
  for (const [x, y, corner] of finderOrigins(matrix.size)) {
    frames += eyeFramePath(eyeFrameShape, x, y, QUIET_ZONE, corner);
    balls += eyeBallPath(eyeBallShape, x, y, QUIET_ZONE);
  }
  return { balls, body: path, frames };
};
