import { useWindowMetrics } from "./use-window-metrics";

export const useNativeScrollMetrics = (spacing: number) => {
  const { scale } = useWindowMetrics();
  return {
    pixelScale: 1 / scale,
    pixelSpacing: Math.max(1, Math.round(spacing / scale)),
  };
};
