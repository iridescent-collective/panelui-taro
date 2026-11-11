type PinnedItems = Readonly<Record<string, boolean>>;
export const moveWithPinned = (
  list: readonly string[],
  laid: readonly string[],
  pinned: PinnedItems,
  id: string,
  from: number,
  to: number
): string[] => {
  if (
    from === to ||
    from < 0 ||
    from >= list.length ||
    to < 0 ||
    to >= list.length ||
    list[from] !== id ||
    pinned[id]
  ) {
    return [...list];
  }
  const moved = [...list];
  moved.splice(from, 1);
  moved.splice(to, 0, id);
  const next: (string | undefined)[] = [];
  let anyPinned = false;
  for (const _item of moved) {
    next.push(undefined);
  }
  for (let i = 0; i < laid.length && i < next.length; i += 1) {
    const at = laid[i];
    if (at !== undefined && pinned[at]) {
      next[i] = at;
      anyPinned = true;
    }
  }
  if (!anyPinned) {
    return moved;
  }
  const free: string[] = [];
  for (const at of moved) {
    if (at !== undefined && !pinned[at]) {
      free.push(at);
    }
  }
  const result: string[] = [];
  let freeIndex = 0;
  for (const held of next) {
    if (held !== undefined) {
      result.push(held);
      continue;
    }
    const take = free[freeIndex];
    freeIndex += 1;
    if (take !== undefined) {
      result.push(take);
    }
  }
  return result;
};
export const stepWithPinned = (
  list: readonly string[],
  laid: readonly string[],
  pinned: PinnedItems,
  id: string,
  from: number,
  delta: number
): string[] => {
  const direction = Math.sign(delta);
  if (direction === 0) {
    return [...list];
  }
  for (
    let to = from + direction;
    to >= 0 && to < list.length;
    to += direction
  ) {
    const next = moveWithPinned(list, laid, pinned, id, from, to);
    if (next.indexOf(id) !== from) {
      return next;
    }
  }
  return [...list];
};
