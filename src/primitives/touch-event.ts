export interface TouchPoint {
  identifier: number;
  clientX: number;
  clientY: number;
}
export const readTouchPoints = (event: unknown): TouchPoint[] => {
  if (
    !event ||
    typeof event !== "object" ||
    !("touches" in event) ||
    !Array.isArray(event.touches)
  ) {
    return [];
  }
  const points: TouchPoint[] = [];
  for (const touch of event.touches) {
    if (
      !touch ||
      typeof touch !== "object" ||
      !("identifier" in touch) ||
      !("clientX" in touch) ||
      !("clientY" in touch)
    ) {
      return [];
    }
    const { identifier, clientX, clientY } = touch;
    if (
      typeof identifier !== "number" ||
      typeof clientX !== "number" ||
      typeof clientY !== "number" ||
      !Number.isFinite(clientX) ||
      !Number.isFinite(clientY)
    ) {
      return [];
    }
    points.push({ clientX, clientY, identifier });
  }
  return points;
};

export const readChangedTouchPoints = (event: unknown): TouchPoint[] => {
  if (!event || typeof event !== "object" || !("changedTouches" in event)) {
    return [];
  }
  return readTouchPoints({ touches: event.changedTouches });
};
