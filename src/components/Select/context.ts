import { createContext, useContext } from "react";

export interface SelectContextValue {
  value: string | undefined;
  onSelect: (value: string) => void;
  query: string;
  setQuery: (query: string) => void;
}
export const SelectContext = createContext<SelectContextValue | null>(null);
export const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select parts must be used within a <Select>");
  }
  return context;
};
export const useSelectSearch = () => {
  const { query, setQuery } = useSelectContext();
  return { query, setQuery };
};
