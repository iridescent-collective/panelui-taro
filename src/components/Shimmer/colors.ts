import { hsvToCss, parseColor } from "../../lib/color";

export const withShimmerAlpha = (color: string, alpha: number) => {
  const parsed = parseColor(color);
  return parsed
    ? hsvToCss(parsed.h, parsed.s, parsed.v, Math.min(1, Math.max(0, alpha)))
    : color;
};
