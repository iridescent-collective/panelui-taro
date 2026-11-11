import { Children, isValidElement, useMemo } from "react";
import type { ReactNode } from "react";

import { BottomSheet } from "../BottomSheet";
import { textChildren } from "../primitives/Text";
import { SelectionModeBar } from "./bar";
import { SelectionModeContext, useSelectionMode } from "./context";
import { SelectionModeHeader } from "./header";
import type {
  SelectionModeContextValue,
  SelectionModeSheetProps,
} from "./types";

export const SelectionModeSheet = ({
  className,
  open,
  defaultOpen,
  onOpenChange,
  title = "Select",
  hideSelectAll = false,
  size = "full",
  children,
}: SelectionModeSheetProps) => {
  const parent = useSelectionMode();
  const { bar, rest } = useMemo(() => {
    const others: ReactNode[] = [];
    let found: ReactNode = null;
    for (const child of Children.toArray(children)) {
      if (isValidElement(child) && child.type === SelectionModeBar) {
        found = child;
      } else {
        others.push(child);
      }
    }
    return { bar: found, rest: others };
  }, [children]);
  const context = useMemo<SelectionModeContextValue>(
    () => ({ ...parent, active: true, sheet: true }),
    [parent]
  );
  return (
    <BottomSheet
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <BottomSheet.Content size={size} showClose={false} className={className}>
        <SelectionModeContext.Provider value={context}>
          <BottomSheet.Header className="pe-0">
            <SelectionModeHeader
              title={title}
              hideSelectAll={hideSelectAll}
              className="h-auto border-b-0 px-0"
            />
          </BottomSheet.Header>
          <BottomSheet.Body contentContainerClassName="flex flex-col gap-[32px] pb-[16px]">
            {textChildren(rest)}
          </BottomSheet.Body>
          {bar ? <BottomSheet.Footer>{bar}</BottomSheet.Footer> : null}
        </SelectionModeContext.Provider>
      </BottomSheet.Content>
    </BottomSheet>
  );
};
SelectionModeSheet.displayName = "SelectionMode.Sheet";
