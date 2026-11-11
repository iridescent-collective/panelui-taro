export interface HsvaColor {
  h: number;

  s: number;

  v: number;

  a: number;
}

export type ColorFormat = "hex" | "rgb" | "hsl";

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

const wrapHue = (h: number) => ((h % 360) + 360) % 360;

export const hsvToRgb = (h: number, s: number, v: number) => {
  const hue = wrapHue(h) / 60;
  const sat = clamp01(s);
  const val = clamp01(v);
  const c = val * sat;
  const x = c * (1 - Math.abs((hue % 2) - 1));
  const m = val - c;

  let r = 0;
  let g = 0;
  let b = 0;
  if (hue < 1) {
    r = c;
    g = x;
  } else if (hue < 2) {
    r = x;
    g = c;
  } else if (hue < 3) {
    g = c;
    b = x;
  } else if (hue < 4) {
    g = x;
    b = c;
  } else if (hue < 5) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return {
    b: Math.round((b + m) * 255),
    g: Math.round((g + m) * 255),
    r: Math.round((r + m) * 255),
  };
};

export const rgbToHsv = (r: number, g: number, b: number) => {
  const rr = clamp01(r / 255);
  const gg = clamp01(g / 255);
  const bb = clamp01(b / 255);
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;

  let h = 0;
  if (d !== 0) {
    if (max === rr) {
      h = 60 * (((gg - bb) / d) % 6);
    } else if (max === gg) {
      h = 60 * ((bb - rr) / d + 2);
    } else {
      h = 60 * ((rr - gg) / d + 4);
    }
  }

  return { h: wrapHue(h), s: max === 0 ? 0 : d / max, v: max };
};

export const hsvToHsl = (h: number, s: number, v: number) => {
  const val = clamp01(v);
  const sat = clamp01(s);
  const l = val * (1 - sat / 2);
  const denominator = Math.min(l, 1 - l);
  return {
    h: wrapHue(h),
    l,
    s: denominator === 0 ? 0 : (val - l) / denominator,
  };
};

export const hsvToCss = (h: number, s: number, v: number, a = 1) => {
  const { r, g, b } = hsvToRgb(h, s, v);
  return `rgba(${r}, ${g}, ${b}, ${clamp01(a)})`;
};

const toHexPair = (n: number) => {
  const clamped = Math.min(255, Math.max(0, Math.round(n)));
  return clamped < 16 ? `0${clamped.toString(16)}` : clamped.toString(16);
};

export const hsvToHex = (h: number, s: number, v: number, a = 1) => {
  const { r, g, b } = hsvToRgb(h, s, v);
  const base = `#${toHexPair(r)}${toHexPair(g)}${toHexPair(b)}`;
  return a >= 1 ? base : `${base}${toHexPair(clamp01(a) * 255)}`;
};

export const formatColor = (color: HsvaColor, format: ColorFormat = "hex") => {
  const { h, s, v, a } = color;
  const alpha = clamp01(a);

  if (format === "rgb") {
    const { r, g, b } = hsvToRgb(h, s, v);
    return alpha >= 1
      ? `rgb(${r}, ${g}, ${b})`
      : `rgba(${r}, ${g}, ${b}, ${Math.round(alpha * 100) / 100})`;
  }

  if (format === "hsl") {
    const hsl = hsvToHsl(h, s, v);
    const sat = Math.round(hsl.s * 100);
    const light = Math.round(hsl.l * 100);
    const hue = Math.round(hsl.h);
    return alpha >= 1
      ? `hsl(${hue}, ${sat}%, ${light}%)`
      : `hsla(${hue}, ${sat}%, ${light}%, ${Math.round(alpha * 100) / 100})`;
  }

  return hsvToHex(h, s, v, alpha);
};

const expandShorthand = (hex: string) => {
  let out = "";
  for (const character of hex) {
    out += character + character;
  }
  return out;
};
const parseHex = (value: string): HsvaColor | null => {
  let body = value.slice(1);
  if (body.length === 3 || body.length === 4) {
    body = expandShorthand(body);
  }
  if ((body.length !== 6 && body.length !== 8) || /[^0-9a-f]/u.test(body)) {
    return null;
  }
  const r = Number.parseInt(body.slice(0, 2), 16);
  const g = Number.parseInt(body.slice(2, 4), 16);
  const b = Number.parseInt(body.slice(4, 6), 16);
  const a = body.length === 8 ? Number.parseInt(body.slice(6, 8), 16) / 255 : 1;
  return { ...rgbToHsv(r, g, b), a };
};
const parseChannel = (raw: string, scale: number) => {
  const percent = raw.endsWith("%");
  const value = Number(percent ? raw.slice(0, -1) : raw.replace(/deg$/u, ""));
  if (!raw || !Number.isFinite(value)) {
    return null;
  }
  return percent ? (value / 100) * scale : value;
};
const parseRgb = (parts: string[], a: number): HsvaColor | null => {
  const r = parseChannel(parts[0] ?? "", 255);
  const g = parseChannel(parts[1] ?? "", 255);
  const b = parseChannel(parts[2] ?? "", 255);
  if (r === null || g === null || b === null) {
    return null;
  }
  return { ...rgbToHsv(r, g, b), a: clamp01(a) };
};
const parseHsl = (parts: string[], a: number): HsvaColor | null => {
  const h = parseChannel(parts[0] ?? "", 360);
  const sl = parseChannel(parts[1] ?? "", 1);
  const l = parseChannel(parts[2] ?? "", 1);
  if (h === null || sl === null || l === null) {
    return null;
  }
  const light = clamp01(l);
  const saturation = (parts[1] ?? "").endsWith("%") || sl <= 1 ? sl : sl / 100;
  const sat = clamp01(saturation);
  const v = light + sat * Math.min(light, 1 - light);
  return {
    a: clamp01(a),
    h: wrapHue(h),
    s: v === 0 ? 0 : 2 * (1 - light / v),
    v,
  };
};
export const parseColor = (input: string): HsvaColor | null => {
  const value = input.trim().toLowerCase();
  if (value.startsWith("#")) {
    return parseHex(value);
  }
  if (!/^(?:rgba?|hsla?)\([^)]*\)$/u.test(value)) {
    return null;
  }
  const parts = value
    .slice(value.indexOf("(") + 1, -1)
    .split(/[\s,/]+/u)
    .filter(Boolean);
  if (parts.length < 3) {
    return null;
  }
  const a = parts[3] === undefined ? 1 : parseChannel(parts[3], 1);
  if (a === null) {
    return null;
  }
  return value.startsWith("rgb") ? parseRgb(parts, a) : parseHsl(parts, a);
};
export const isValidColor = (input: string) => parseColor(input) !== null;
export const withColorAlpha = (color: string, alpha: number) => {
  const parsed = parseColor(color);
  return parsed ? hsvToCss(parsed.h, parsed.s, parsed.v, alpha) : color;
};
