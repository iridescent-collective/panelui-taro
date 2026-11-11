import { useCallback, useMemo, useState } from "react";

interface PlannerMonthLifecycleOptions {
  month: Date | undefined;
  defaultMonth: Date | undefined;
  settleMonth: (month: Date) => Date;
  onMonthChange: ((month: Date) => void) | undefined;
}
export const usePlannerMonthLifecycle = ({
  month: monthProp,
  defaultMonth,
  settleMonth,
  onMonthChange,
}: PlannerMonthLifecycleOptions): readonly [Date, (month: Date) => void] => {
  const [internalMonth, setInternalMonth] = useState(() =>
    settleMonth(defaultMonth ?? new Date())
  );
  const isControlled = monthProp !== undefined;
  const controlledMonth = useMemo(
    () => (monthProp === undefined ? undefined : settleMonth(monthProp)),
    [monthProp?.getTime(), settleMonth]
  );
  const month = controlledMonth ?? internalMonth;
  const setMonth = useCallback(
    (next: Date) => {
      const settled = settleMonth(next);
      if (!isControlled) {
        setInternalMonth(settled);
      }
      onMonthChange?.(settled);
    },
    [isControlled, onMonthChange, settleMonth]
  );
  return [month, setMonth] as const;
};
interface PlannerSelectionLifecycleOptions {
  selected: Date | null | undefined;
  defaultSelected: Date | null;
  onSelectedChange: ((date: Date | null) => void) | undefined;
}
export const usePlannerSelectionLifecycle = ({
  selected: selectedProp,
  defaultSelected,
  onSelectedChange,
}: PlannerSelectionLifecycleOptions): readonly [
  Date | null,
  (date: Date | null) => void,
] => {
  const [internalSelected, setInternalSelected] = useState<Date | null>(
    defaultSelected
  );
  const isControlled = selectedProp !== undefined;
  const selected = isControlled ? selectedProp : internalSelected;
  const select = useCallback(
    (date: Date | null) => {
      if (!isControlled) {
        setInternalSelected(date);
      }
      onSelectedChange?.(date);
    },
    [isControlled, onSelectedChange]
  );
  return [selected, select] as const;
};
