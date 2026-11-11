export const AI_INPUT_METRICS = {
  lg: { fontSize: 17, lineHeight: 24, padding: 14 },
  md: { fontSize: 16, lineHeight: 22, padding: 12 },
  sm: { fontSize: 15, lineHeight: 20, padding: 10 },
} as const;
export type AIInputSize = keyof typeof AI_INPUT_METRICS;
export interface GrowthMetrics {
  lineHeight: number;
  padding: number;
}
export interface GrowthBounds {
  minHeight: number;
  maxHeight: number;
}
export const heightForLines = (metrics: GrowthMetrics, lines: number) =>
  lines * metrics.lineHeight + metrics.padding * 2;
export const growthBounds = (
  metrics: GrowthMetrics,
  minRows: number,
  maxRows: number
): GrowthBounds => {
  const floor = Math.max(1, Math.floor(minRows) || 1);
  const ceiling = Math.max(floor, Math.floor(maxRows) || floor);
  return {
    maxHeight: heightForLines(metrics, ceiling),
    minHeight: heightForLines(metrics, floor),
  };
};
