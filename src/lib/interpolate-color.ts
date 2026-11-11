import { hsvToRgb, parseColor } from "./color";

const readColor = (color: string) =>
  color === "transparent"
    ? { a: 0, b: 0, g: 0, r: 0 }
    : (() => {
        const value = parseColor(color);
        return value
          ? { ...hsvToRgb(value.h, value.s, value.v), a: value.a }
          : null;
      })();
export const interpolatePanelColor = (
  from: string,
  to: string,
  value: number
) => {
  const p = Math.min(1, Math.max(0, value));
  if (p === 0) {
    return from;
  }
  if (p === 1) {
    return to;
  }
  const start = readColor(from);
  const end = readColor(to);
  if (!start || !end) {
    return p < 0.5 ? from : to;
  }
  const channel = (a: number, b: number) =>
    Math.round((a ** 2.2 + (b ** 2.2 - a ** 2.2) * p) ** (1 / 2.2));
  return `rgba(${channel(start.r, end.r)}, ${channel(start.g, end.g)}, ${channel(start.b, end.b)}, ${start.a + (end.a - start.a) * p})`;
};
