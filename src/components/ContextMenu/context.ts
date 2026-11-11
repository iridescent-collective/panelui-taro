import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { ContextMenuTargetRect } from "./types";

export interface ContextMenuContextValue {
  target: ContextMenuTargetRect | null;
  setTarget: (rect: ContextMenuTargetRect | null) => void;
  content: ReactNode;
  setContent: (content: ReactNode) => void;
  hasPreview: boolean;
}
export const ContextMenuContext = createContext<ContextMenuContextValue | null>(
  null
);
export const useContextMenu = (part: string) => {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error(`${part} must be used inside <ContextMenu>.`);
  }
  return context;
};
