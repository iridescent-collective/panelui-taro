import { createContext, useContext } from "react";

import type {
  TabLayout,
  TabsVariant,
  TabsSize,
  TabsKeepMounted,
} from "./types";

export const TabsContext = createContext<{
  value: string;
  setValue: (value: string) => void;
  registerLayout: (value: string, layout: TabLayout) => void;
  unregisterLayout: (value: string) => void;
  layouts: Record<string, TabLayout>;
  variant: TabsVariant;
  size: TabsSize;
  keepMounted: TabsKeepMounted;
  pager: boolean;
  animationDisabled: boolean;
} | null>(null);
export const TabsListContext = createContext<{
  scrollable: boolean;
  registerTrigger?: (value: string, id: string) => () => void;
}>({ scrollable: false });
export const useTabs = (component: string) => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Tabs>`);
  }
  return context;
};
