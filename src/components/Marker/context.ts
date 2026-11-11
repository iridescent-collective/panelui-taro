import { createContext } from "react";

import type { MarkerVariant } from "./types";

export const MarkerContext = createContext<MarkerVariant>("default");
