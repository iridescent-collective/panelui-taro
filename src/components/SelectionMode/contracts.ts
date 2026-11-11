const selectionLimit = (max?: number): number => {
  if (max === undefined || max === Infinity) {
    return Infinity;
  }
  return Number.isFinite(max) ? Math.max(0, Math.floor(max)) : 0;
};

export const selectValue = (
  selected: string[],
  value: string,
  max?: number
): string[] => {
  if (selected.includes(value) || !(selected.length < selectionLimit(max))) {
    return selected;
  }
  return [...selected, value];
};

export const toggleValue = (
  selected: string[],
  value: string,
  max?: number
): string[] =>
  selected.includes(value)
    ? selected.filter((entry) => entry !== value)
    : selectValue(selected, value, max);

export const selectAllValues = (values: string[], max?: number): string[] => {
  const limit = selectionLimit(max);
  return limit === Infinity ? [...values] : values.slice(0, limit);
};

export const selectionTarget = (total: number, max?: number): number =>
  Math.min(total, selectionLimit(max));

export const selectionOwnsPress = (
  active: boolean,
  disabled: boolean
): boolean => active && !disabled;

export const handleSelectionItemPress = (
  active: boolean,
  disabled: boolean,
  toggle: () => void,
  action?: () => void
): void => {
  if (selectionOwnsPress(active, disabled)) {
    toggle();
  } else {
    action?.();
  }
};

export const canEnterSelection = (
  active: boolean,
  disabled: boolean,
  sheet: boolean
): boolean => !active && !disabled && !sheet;
