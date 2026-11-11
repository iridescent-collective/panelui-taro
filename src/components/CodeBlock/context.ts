import { createContext, useContext } from "react";

export const CodeBlockContext = createContext<{ code: string } | null>(null);
export const useCodeBlock = (component: string) => {
  const context = useContext(CodeBlockContext);
  if (!context) {
    throw new Error(`${component} must be used within a <CodeBlock>`);
  }
  return context;
};
