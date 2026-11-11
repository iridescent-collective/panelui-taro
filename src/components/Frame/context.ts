import { createContext } from "react";

import type { FrameVariant } from "./types";

export const FrameVariantContext = createContext<FrameVariant>("default");
export const FrameSlotContext = createContext(false);
