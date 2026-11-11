import { createContext } from "react";

import type { ToastVariant } from "./toast-store";

export const ToastContext = createContext<{
  variant: ToastVariant;
  hide: () => void;
}>({ hide: () => false, variant: "default" });
