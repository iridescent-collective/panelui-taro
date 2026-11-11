export const strokePath = (points: number[]): string => {
  const count = points.length / 2;
  if (count === 0) {
    return "";
  }

  if (count === 1) {
    return `M${points[0]},${points[1]} l0.01,0`;
  }

  let d = `M${points[0]},${points[1]}`;
  for (let i = 1; i < count; i += 1) {
    const px = points[(i - 1) * 2];
    const py = points[(i - 1) * 2 + 1];
    const x = points[i * 2];
    const y = points[i * 2 + 1];

    d += ` Q${px},${py} ${(px + x) / 2},${(py + y) / 2}`;
  }

  d += ` L${points[(count - 1) * 2]},${points[(count - 1) * 2 + 1]}`;
  return d;
};
