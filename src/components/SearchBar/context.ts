import { createContext } from "react";

import type { SearchBarContextValue } from "./types";

export const SearchBarContext = createContext<SearchBarContextValue | null>(
  null
);
