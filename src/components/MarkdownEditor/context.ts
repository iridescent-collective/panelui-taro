import { createContext, useContext } from "react";

import type { MarkdownEditorContextValue } from "./types";

export const MarkdownEditorContext =
  createContext<MarkdownEditorContextValue | null>(null);
export const useMarkdownEditor = () => {
  const context = useContext(MarkdownEditorContext);
  if (!context) {
    throw new Error(
      "MarkdownEditor parts must be used inside <MarkdownEditor>."
    );
  }
  return context;
};
