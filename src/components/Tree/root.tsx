import { View } from "@tarojs/components";
import { forwardRef, useCallback, useMemo, useState } from "react";
import type { ComponentRef } from "react";

import { TreeContext } from "./context";
import type { TreeProps } from "./types";
import { treeVariants } from "./variants";

const toArray = (value?: string | string[]) => {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};
const toggleValue = (values: string[], value: string) =>
  values.includes(value)
    ? values.filter((entry) => entry !== value)
    : [...values, value];
export const TreeRoot = forwardRef<ComponentRef<typeof View>, TreeProps>(
  (
    {
      className,
      size = "default",
      selectionMode = "none",
      value,
      defaultValue,
      onValueChange,
      expanded,
      defaultExpanded,
      onExpandedChange,
      expandOnPress = true,
      showLines = false,
      indent = 16,
      children,
      ...props
    },
    ref
  ) => {
    const [internalExpanded, setInternalExpanded] = useState(
      () => defaultExpanded ?? []
    );
    const expandedValues = expanded ?? internalExpanded;
    const [internalSelected, setInternalSelected] = useState(() =>
      toArray(defaultValue)
    );
    const selected = value === undefined ? internalSelected : toArray(value);
    const toggleExpanded = useCallback(
      (itemValue: string) => {
        const next = toggleValue(expandedValues, itemValue);
        if (expanded === undefined) {
          setInternalExpanded(next);
        }
        onExpandedChange?.(next);
      },
      [expanded, expandedValues, onExpandedChange]
    );
    const select = useCallback(
      (itemValue: string) => {
        if (selectionMode === "none") {
          return;
        }
        const next =
          selectionMode === "single"
            ? [itemValue]
            : toggleValue(selected, itemValue);
        if (value === undefined) {
          setInternalSelected(next);
        }
        onValueChange?.(selectionMode === "single" ? (next[0] ?? "") : next);
      },
      [selected, selectionMode, value, onValueChange]
    );
    const context = useMemo(
      () => ({
        expandOnPress,
        expanded: expandedValues,
        indent,
        select,
        selected,
        selectionMode,
        showLines,
        size,
        toggleExpanded,
      }),
      [
        expandedValues,
        toggleExpanded,
        selected,
        select,
        selectionMode,
        expandOnPress,
        showLines,
        indent,
        size,
      ]
    );
    return (
      <TreeContext.Provider value={context}>
        <View
          {...props}
          ref={ref}
          role="list"
          aria-role="list"
          className={treeVariants({ size }).root({ className })}
        >
          {children}
        </View>
      </TreeContext.Provider>
    );
  }
);
