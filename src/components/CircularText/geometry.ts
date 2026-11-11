export const DEFAULT_CIRCULAR_TEXT_RADIUS = 90;
export const DEFAULT_CIRCULAR_TEXT_DURATION = 20_000;
export const DEFAULT_CIRCULAR_TEXT_SPREAD = 360;
export const normalizeRadius = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_CIRCULAR_TEXT_RADIUS;
  }
  return Math.max(value, 0);
};
export const normalizeDuration = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_CIRCULAR_TEXT_DURATION;
  }
  return Math.max(value, 0);
};
export const normalizeSpread = (value: number): number => {
  if (!Number.isFinite(value)) {
    return DEFAULT_CIRCULAR_TEXT_SPREAD;
  }
  return Math.min(Math.abs(value), 360);
};
export interface CircularTextGlyph {
  character: string;
  index: number;
  angle: number;
}
export const circularTextGlyphs = (
  text: string,
  spread: number,
  startAngle: number
): CircularTextGlyph[] => {
  const characters = [...text];
  if (characters.length === 0) {
    return [];
  }
  const arc = normalizeSpread(spread);
  const from = Number.isFinite(startAngle) ? startAngle : 0;
  const closed = arc >= 360;
  const step =
    characters.length === 1
      ? 0
      : arc / (closed ? characters.length : characters.length - 1);
  return characters.map((character, index) => ({
    angle: from + step * index,
    character,
    index,
  }));
};
