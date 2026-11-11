import { createContext, useContext } from "react";

import type { ViewerStore } from "./store";

export const ViewerContext = createContext<{
  store: ViewerStore;
  hiddenId: string | null;
  openItem: (id: string) => void;
} | null>(null);
export const useViewer = () => {
  const ctx = useContext(ViewerContext);
  if (!ctx) {
    throw new Error("ImageViewer.Trigger must be used inside <ImageViewer>.");
  }
  return ctx;
};
