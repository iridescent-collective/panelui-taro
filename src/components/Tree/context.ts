import { createContext, useContext } from "react";

import type { TreeContextValue, TreeItemContextValue } from "./types";

export const TreeContext = createContext<TreeContextValue | null>(null);
export const TreeItemContext = createContext<TreeItemContextValue | null>(null);
export const useTree = (component: string) => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Tree>`);
  }
  return context;
};
export const useTreeItem = (component: string) => {
  const context = useContext(TreeItemContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Tree.Item>`);
  }
  return context;
};
