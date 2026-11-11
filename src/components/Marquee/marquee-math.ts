export const DEFAULT_MARQUEE_SPEED = 40;
export const MAX_MARQUEE_COPIES = 32;
export const normalizeMarqueeSpeed = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_MARQUEE_SPEED;
  }
  return Math.max(value, 0);
};
export const normalizeMarqueeSpacing = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.max(value, 0);
};
export const marqueeCopyCount = (
  viewport: number,
  content: number,
  spacing: number
): {
  period: number;
  count: number;
} => {
  const safeViewport = Number.isFinite(viewport) ? Math.max(viewport, 0) : 0;
  const safeContent = Number.isFinite(content) ? Math.max(content, 0) : 0;
  const naturalPeriod =
    safeContent > 0 ? safeContent + normalizeMarqueeSpacing(spacing) : 0;
  if (naturalPeriod <= 0 || safeViewport <= 0) {
    return { count: 0, period: naturalPeriod };
  }
  const minimumPeriod = safeViewport / (MAX_MARQUEE_COPIES - 2);
  const period = Math.max(naturalPeriod, minimumPeriod);
  return {
    count: Math.min(MAX_MARQUEE_COPIES, Math.ceil(safeViewport / period) + 2),
    period,
  };
};
