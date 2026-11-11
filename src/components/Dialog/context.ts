import { createContext, useContext } from "react";

export interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
export const DialogContext = createContext<DialogContextValue | null>(null);
export const useDialog = (part: string) => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error(`${part} must be used within a <Dialog>`);
  }
  return context;
};
