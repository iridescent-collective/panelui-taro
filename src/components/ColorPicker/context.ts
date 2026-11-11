import { createContext, useContext, useSyncExternalStore } from "react";

import type { HsvaColor, ColorFormat } from "../../lib/color";
import type { ObservableValue } from "../../primitives/observable-value";
import type { ColorPickerSize } from "./types";

export interface ColorPickerContextValue {
  signal: ObservableValue<HsvaColor>;
  emit: (color: HsvaColor, commit: boolean) => void;
  format: ColorFormat;
  disabled: boolean;
  haptics: boolean;
  size: ColorPickerSize;
}
export const ColorPickerContext = createContext<ColorPickerContextValue | null>(
  null
);
export const useColorPicker = () => {
  const context = useContext(ColorPickerContext);
  if (!context) {
    throw new Error("ColorPicker parts must be used inside <ColorPicker>.");
  }
  return context;
};
export const useColorFrame = () => {
  const ctx = useColorPicker();
  const color = useSyncExternalStore(
    ctx.signal.subscribe,
    ctx.signal.getSnapshot,
    ctx.signal.getSnapshot
  );
  return { color, ctx };
};
