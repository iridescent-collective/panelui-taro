export const easeInOutQuad = (value: number) =>
  value < 0.5 ? 2 * value * value : 1 - (-2 * value + 2) ** 2 / 2;
