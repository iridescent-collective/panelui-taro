import { hsvToCss, parseColor } from "../../lib/color";

export const mutedUploadFill = (color: string) => {
  const parsed = parseColor(color);
  return parsed
    ? hsvToCss(parsed.h, parsed.s, parsed.v, parsed.a * 0.4)
    : color;
};
