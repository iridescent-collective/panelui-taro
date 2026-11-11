import type { SeriesColorIndex } from "../lib/chart";
import { useThemeToken } from "./use-theme";

export const useSeriesColor = (
  explicit: string | undefined,
  index: SeriesColorIndex
): string => {
  const token = useThemeToken(`chart-${index}`);
  return explicit ?? token;
};
