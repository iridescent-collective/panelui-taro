import { createContext, useContext } from "react";

import type { useSortableModel } from "./use-model";
import type { useSortableTouch } from "./use-touch";

export const SortableContext = createContext<ReturnType<
  typeof useSortableModel
> | null>(null);
export const useSortableRoot = () => {
  const context = useContext(SortableContext);
  if (!context) {
    throw new Error("Sortable parts must be used inside <Sortable>.");
  }
  return context;
};
export const SortableItemContext = createContext<{
  id: string;
  index: number;
  isActive: boolean;
  disabled: boolean;
  touch: ReturnType<typeof useSortableTouch>;
} | null>(null);
export const useSortableItem = () => {
  const context = useContext(SortableItemContext);
  if (!context) {
    throw new Error("useSortableItem must be used inside <Sortable.Item>.");
  }
  const { id, index, isActive, disabled } = context;
  return { disabled, id, index, isActive };
};
