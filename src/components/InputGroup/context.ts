import { createContext, useContext } from "react";

import type { InputGroupState } from "./types";

export const InputGroupContext = createContext<InputGroupState | null>(null);
export const useInputGroup = () => useContext(InputGroupContext);
