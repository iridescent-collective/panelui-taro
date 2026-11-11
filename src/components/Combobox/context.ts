import { createContext, useContext } from "react";

export const ComboboxContext = createContext<{
  values: string[];
  onSelect: (value: string, label: string) => void;
} | null>(null);
export const useComboboxContext = () => {
  const context = useContext(ComboboxContext);
  if (!context) {
    throw new Error("Combobox.Item must be used within a <Combobox>");
  }
  return context;
};
