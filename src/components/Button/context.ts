import { createContext, useContext } from "react";

import type { BUTTON_SIZE, BUTTON_VARIANT } from "./constants";

export interface ButtonGroupContextValue {
  variant?: keyof typeof BUTTON_VARIANT;
  size?: keyof typeof BUTTON_SIZE;
  attached: boolean;
  fullWidth: boolean;
}

export const ButtonGroupContext = createContext<ButtonGroupContextValue | null>(
  null
);

export const useButtonGroup = (): ButtonGroupContextValue | null =>
  useContext(ButtonGroupContext);
