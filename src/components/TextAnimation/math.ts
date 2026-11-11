export const withAlpha = (color: string, alpha: number): string => {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const full =
      hex.length === 3 ? [...hex].map((c) => c + c).join("") : hex.slice(0, 6);
    const r = Number.parseInt(full.slice(0, 2), 16);
    const g = Number.parseInt(full.slice(2, 4), 16);
    const b = Number.parseInt(full.slice(4, 6), 16);
    if (Number.isNaN(r + g + b)) {
      return color;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const match = color.match(/rgba?\([^)]+\)/u)?.[0];
  const channels = match?.slice(match.indexOf("(") + 1, -1);
  if (channels) {
    const [r, g, b] = channels.split(",").map((part) => part.trim());
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
};
export const scrollingValues = (
  value: number,
  step: number,
  around: number
) => {
  const out: number[] = [];
  for (let index = -around; value + around * step >= index * step; index += 1) {
    out.push(index * step);
    if (out.length > 400) {
      break;
    }
  }
  const found = out.indexOf(value);
  return {
    rows: around * 2 + 1,
    target: Math.max(0, (found === -1 ? out.length - 1 : found) - around),
    values: out,
  };
};
