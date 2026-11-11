import { useCallback, useMemo, useRef, useState } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { selectionTick } from "../../lib/haptics";
import {
  selectAllValues,
  selectionTarget,
  selectValue,
  toggleValue,
} from "./contracts";
import type { SelectionModeContextValue, SelectionModeProps } from "./types";

export const useSelectionState = (
  props: SelectionModeProps
): SelectionModeContextValue => {
  const [internalActive, setInternalActive] = useState(
    props.defaultActive ?? false
  );
  const [internalSelected, setInternalSelected] = useState(
    props.defaultSelected ?? []
  );
  const active = props.active ?? internalActive;
  const selected = props.selected ?? internalSelected;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const latest = useRef(props);
  latest.current = props;
  const setSelected = useCallback((next: string[]) => {
    if (latest.current.selected === undefined) {
      selectedRef.current = next;
      setInternalSelected(next);
    }
    latest.current.onSelectedChange?.(next);
  }, []);
  const setActive = useCallback((next: boolean) => {
    if (latest.current.active === undefined) {
      setInternalActive(next);
    }
    latest.current.onActiveChange?.(next);
  }, []);
  const enter = useCallback(
    async (value?: string) => {
      setActive(true);
      if (value !== undefined) {
        const next = selectValue(
          selectedRef.current,
          value,
          latest.current.max
        );
        if (next !== selectedRef.current) {
          setSelected(next);
        }
      }
      if (latest.current.haptics) {
        await selectionTick();
      }
    },
    [setActive, setSelected]
  );
  const exit = useCallback(() => {
    setActive(false);
    setSelected([]);
  }, [setActive, setSelected]);
  const isSelected = useCallback(
    (value: string) => selectedRef.current.includes(value),
    []
  );
  const toggle = useCallback(
    async (value: string) => {
      const { current } = selectedRef;
      const next = toggleValue(current, value, latest.current.max);
      if (next === current) {
        return;
      }
      setSelected(next);
      if (!current.includes(value) && latest.current.haptics) {
        await selectionTick();
      }
    },
    [setSelected]
  );
  const selectAll = useCallback(() => {
    const { values, max } = latest.current;
    if (values) {
      setSelected(selectAllValues(values, max));
    }
  }, [setSelected]);
  const clear = useCallback(() => setSelected([]), [setSelected]);
  const total = props.values?.length ?? 0;
  const count = selected.length;
  const target = selectionTarget(total, props.max);
  useBackHandler(active, exit);
  return useMemo(
    () => ({
      active,
      allSelected: target > 0 && count >= target,
      clear,
      count,
      enter,
      exit,
      haptics: props.haptics ?? false,
      isSelected,
      max: props.max,
      selectAll,
      selected,
      sheet: false,
      toggle,
      total,
    }),
    [
      active,
      selected,
      enter,
      exit,
      isSelected,
      toggle,
      selectAll,
      clear,
      target,
      count,
      total,
      props.max,
      props.haptics,
    ]
  );
};
