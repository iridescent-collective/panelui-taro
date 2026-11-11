import "./panel-accessibility";
import { useState } from "react";
import type { PropsWithChildren } from "react";

import { setTheme } from "../../src/theme/store";
import { ensureCustomizationThemes } from "./customization/theme-config";
import { readSavedTheme } from "./services/native-theme";

import "./styles/tailwind.css";
import "./app.scss";

export default function App({ children }: PropsWithChildren) {
  useState(() => {
    ensureCustomizationThemes();
    setTheme(readSavedTheme());
    return true;
  });
  return children;
}
