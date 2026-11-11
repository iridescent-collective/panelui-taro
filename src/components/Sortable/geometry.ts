export const reorderItems = <T>(
  items: readonly T[],
  from: number,
  to: number
): T[] => {
  if (from === to) {
    return [...items];
  }
  if (from < 0 || from >= items.length) {
    return [...items];
  }
  if (to < 0 || to >= items.length) {
    return [...items];
  }
  const next = [...items];
  const moved = next.splice(from, 1);
  next.splice(to, 0, ...moved);
  return next;
};
export const slotOffset = (
  order: readonly string[],
  id: string,
  heights: Record<string, number>,
  gap: number
): number => {
  let offset = 0;
  for (const at of order) {
    if (at === id) {
      return offset;
    }
    offset += (at === undefined ? 0 : (heights[at] ?? 0)) + gap;
  }
  return offset;
};
export const slotCenter = (
  order: readonly string[],
  index: number,
  heights: Record<string, number>,
  gap: number
): number => {
  let offset = 0;
  for (let i = 0; i < index; i += 1) {
    const at = order[i];
    offset += (at === undefined ? 0 : (heights[at] ?? 0)) + gap;
  }
  const self = order[index];
  return offset + (self === undefined ? 0 : (heights[self] ?? 0)) / 2;
};
export const targetIndex = (
  order: readonly string[],
  current: number,
  top: number,
  height: number,
  heights: Record<string, number>,
  gap: number
): number => {
  const self = order[current];
  const restingTop =
    slotCenter(order, current, heights, gap) -
    (self === undefined ? 0 : (heights[self] ?? 0)) / 2;
  if (top < restingTop) {
    let target = current;
    for (let i = current - 1; i >= 0; i -= 1) {
      if (top >= slotCenter(order, i, heights, gap)) {
        break;
      }
      target = i;
    }
    return target;
  }
  const bottom = top + height;
  let target = current;
  for (let i = current + 1; i < order.length; i += 1) {
    if (bottom <= slotCenter(order, i, heights, gap)) {
      break;
    }
    target = i;
  }
  return target;
};
