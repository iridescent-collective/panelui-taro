import { createContext, useContext } from "react";

import type { QrMatrix } from "./qr-encode";
import type { QRCodeSize } from "./types";
import type { qrCodeVariants } from "./variants";

export interface QRCodeContextValue {
  matrix: QrMatrix | null;
  error: string | null;
  value: string;
  size: QRCodeSize;
  logoFraction: number;
  slots: ReturnType<typeof qrCodeVariants>;
}
export const QRCodeContext = createContext<QRCodeContextValue | null>(null);
export const useQRCode = (part: string) => {
  const context = useContext(QRCodeContext);
  if (!context) {
    throw new Error(`${part} must be used inside <QRCode>.`);
  }
  return context;
};
