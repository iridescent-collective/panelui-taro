import { createContext, useContext } from "react";

import type { PageHeaderContextValue, PageHeaderStatsLayout } from "./types";

export const PageHeaderContext = createContext<
  PageHeaderContextValue | undefined
>(undefined);
export const PageHeaderRowContext = createContext(false);
export const PageHeaderStatsContext =
  createContext<PageHeaderStatsLayout>("stacked");
export const usePageHeader = (part: string) => {
  const context = useContext(PageHeaderContext);
  if (!context) {
    throw new Error(`${part} must be used within a <PageHeader>`);
  }
  return context;
};
