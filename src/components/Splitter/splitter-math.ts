export const DEFAULT_MIN_SIZE = 10;
export const DEFAULT_MAX_SIZE = 100;
export interface SplitterConstraint {
  minSize: number;
  maxSize: number;
  collapsible: boolean;
  collapsedSize: number;
}
export interface SplitterConstraintInput {
  minSize?: number;
  maxSize?: number;
  collapsible?: boolean;
  collapsedSize?: number;
}
const clamp = (value: number, low: number, high: number): number =>
  Math.min(Math.max(value, low), high);
const finite = (value: number | undefined, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;
export const panelFloor = (constraint: SplitterConstraint): number =>
  constraint.collapsible ? constraint.collapsedSize : constraint.minSize;
export const normalizeConstraint = (
  input: SplitterConstraintInput | undefined
): SplitterConstraint => {
  const minSize = clamp(finite(input?.minSize, DEFAULT_MIN_SIZE), 0, 100);
  const maxSize = clamp(finite(input?.maxSize, DEFAULT_MAX_SIZE), minSize, 100);
  const collapsible = input?.collapsible === true;
  const collapsedSize = clamp(finite(input?.collapsedSize, 0), 0, minSize);
  return { collapsedSize, collapsible, maxSize, minSize };
};
const total = (layout: number[]): number => {
  let sum = 0;
  for (const size of layout) {
    sum += size;
  }
  return sum;
};
const settle = (
  layout: number[],
  constraints: SplitterConstraint[]
): number[] => {
  const next = [...layout];
  for (let pass = 0; pass < 4; pass += 1) {
    const remainder = 100 - total(next);
    if (Math.abs(remainder) < 1e-6) {
      break;
    }
    let room = 0;
    const headroom: number[] = [];
    for (let index = 0; index < next.length; index += 1) {
      const constraint = constraints[index]!;
      const available =
        remainder > 0
          ? constraint.maxSize - next[index]!
          : next[index]! - panelFloor(constraint);
      headroom.push(Math.max(available, 0));
      room += Math.max(available, 0);
    }
    if (room <= 1e-6) {
      break;
    }
    for (let index = 0; index < next.length; index += 1) {
      next[index] = clamp(
        next[index]! + (remainder * headroom[index]!) / room,
        panelFloor(constraints[index]!),
        constraints[index]!.maxSize
      );
    }
  }
  const sum = total(next);
  if (sum > 100 + 1e-6) {
    for (let index = 0; index < next.length; index += 1) {
      next[index] = (next[index]! * 100) / sum;
    }
  }
  return next;
};
export const resolveLayout = (
  sizes: (number | undefined)[],
  constraints: SplitterConstraint[]
): number[] => {
  if (constraints.length === 0) {
    return [];
  }
  let claimed = 0;
  let unsized = 0;
  for (let index = 0; index < constraints.length; index += 1) {
    const size = sizes[index];
    if (typeof size === "number" && Number.isFinite(size)) {
      claimed += clamp(size, 0, 100);
    } else {
      unsized += 1;
    }
  }
  const share = unsized > 0 ? Math.max(100 - claimed, 0) / unsized : 0;
  const layout: number[] = [];
  for (let index = 0; index < constraints.length; index += 1) {
    const size = sizes[index];
    const raw =
      typeof size === "number" && Number.isFinite(size)
        ? clamp(size, 0, 100)
        : share;
    layout.push(
      clamp(raw, panelFloor(constraints[index]!), constraints[index]!.maxSize)
    );
  }
  return settle(layout, constraints);
};
const snapDown = (size: number, constraint: SplitterConstraint): number => {
  if (size >= constraint.minSize) {
    return size;
  }
  if (!constraint.collapsible) {
    return constraint.minSize;
  }
  return size < (constraint.collapsedSize + constraint.minSize) / 2
    ? constraint.collapsedSize
    : constraint.minSize;
};
export const resizeLayout = (
  layout: number[],
  boundary: number,
  delta: number,
  constraints: SplitterConstraint[]
): number[] => {
  const next = [...layout];
  if (boundary < 0 || boundary + 1 >= next.length) {
    return next;
  }
  if (!Number.isFinite(delta)) {
    return next;
  }
  const first = constraints[boundary];
  const second = constraints[boundary + 1];
  if (!first || !second) {
    return next;
  }
  const pair = next[boundary]! + next[boundary + 1]!;
  let intended = next[boundary]! + delta;
  if (delta < 0) {
    intended = snapDown(intended, first);
  } else if (delta > 0) {
    intended = pair - snapDown(pair - intended, second);
  }
  const low = Math.max(panelFloor(first), pair - second.maxSize);
  const high = Math.min(first.maxSize, pair - panelFloor(second));
  if (low > high) {
    return next;
  }
  next[boundary] = clamp(intended, low, high);
  next[boundary + 1] = pair - next[boundary]!;
  return next;
};
export const resetLayout = (
  layout: number[],
  initial: number[],
  boundary: number,
  constraints: SplitterConstraint[]
): number[] => {
  const next = [...layout];
  if (boundary < 0 || boundary + 1 >= next.length) {
    return next;
  }
  const pair = next[boundary]! + next[boundary + 1]!;
  const first = initial[boundary];
  const second = initial[boundary + 1];
  if (
    !Number.isFinite(pair) ||
    typeof first !== "number" ||
    !Number.isFinite(first) ||
    typeof second !== "number" ||
    !Number.isFinite(second) ||
    first + second <= 0
  ) {
    return next;
  }
  const target = (first / (first + second)) * pair;
  return resizeLayout(next, boundary, target - next[boundary]!, constraints);
};
export const layoutOffset = (layout: number[], boundary: number): number => {
  let offset = 0;
  for (let index = 0; index <= boundary && index < layout.length; index += 1) {
    offset += layout[index]!;
  }
  return offset;
};
export const isCollapsed = (
  size: number,
  constraint: SplitterConstraint
): boolean => constraint.collapsible && size <= constraint.collapsedSize + 1e-6;
