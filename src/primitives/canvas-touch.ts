export interface CanvasPoint {
  identifier: number;
  x: number;
  y: number;
}
export const readCanvasPoints = (event: unknown): CanvasPoint[] => {
  if (
    !event ||
    typeof event !== "object" ||
    !("touches" in event) ||
    !Array.isArray(event.touches)
  ) {
    return [];
  }
  const points: CanvasPoint[] = [];
  for (const touch of event.touches) {
    if (
      !touch ||
      typeof touch !== "object" ||
      !("identifier" in touch) ||
      !("x" in touch) ||
      !("y" in touch)
    ) {
      return [];
    }
    const { identifier, x, y } = touch;
    if (
      typeof identifier !== "number" ||
      typeof x !== "number" ||
      typeof y !== "number" ||
      !Number.isFinite(x) ||
      !Number.isFinite(y)
    ) {
      return [];
    }
    points.push({ identifier, x, y });
  }
  return points;
};
