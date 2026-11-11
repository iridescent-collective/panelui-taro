export const indexForAccessibilityAction = (
  index: number,
  length: number,
  actionName: string,
  disabled = false
): number | undefined => {
  let direction = 0;
  if (actionName === "increment") {
    direction = 1;
  }
  if (actionName === "decrement") {
    direction = -1;
  }
  if (disabled || direction === 0 || length <= 0) {
    return undefined;
  }
  const next = Math.min(Math.max(index + direction, 0), length - 1);
  return next === index ? undefined : next;
};
export const accessibilityValueForIndex = (
  index: number,
  length: number,
  text: string
) => {
  const max = Math.max(0, length - 1);
  return {
    max,
    min: 0,
    now: Math.min(Math.max(index, 0), max),
    text,
  };
};
