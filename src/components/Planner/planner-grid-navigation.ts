export type PlannerGridNavigationKey =
  | "ArrowLeft"
  | "ArrowRight"
  | "ArrowUp"
  | "ArrowDown"
  | "Home"
  | "End";
export type PlannerGridNavigable = (index: number) => boolean;
export const plannerGridTarget = (
  key: string,
  index: number,
  count: number,
  columns = 7,
  navigable?: PlannerGridNavigable
): number | null => {
  if (!Number.isInteger(index) || index < 0 || index >= count || columns < 1) {
    return null;
  }
  let target: number;
  let step: number;
  switch (key as PlannerGridNavigationKey) {
    case "ArrowLeft": {
      target = index - 1;
      step = -1;
      break;
    }
    case "ArrowRight": {
      target = index + 1;
      step = 1;
      break;
    }
    case "ArrowUp": {
      target = index - columns;
      step = -columns;
      break;
    }
    case "ArrowDown": {
      target = index + columns;
      step = columns;
      break;
    }
    case "Home": {
      target = index - (index % columns);
      step = 1;
      break;
    }
    case "End": {
      target = index + (columns - 1 - (index % columns));
      step = -1;
      break;
    }
    default: {
      return null;
    }
  }
  if (target < 0 || target >= count) {
    return index;
  }
  if (!navigable) {
    return target;
  }
  while (target !== index && !navigable(target)) {
    target += step;
    if (target < 0 || target >= count) {
      return index;
    }
  }
  return target;
};
