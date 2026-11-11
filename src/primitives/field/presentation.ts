import { getWindowInfo } from "@tarojs/taro";

import { useThemeToken } from "../../theme/use-theme";

export const useFieldColors = (invalid: boolean, focused: boolean) => {
  const placeholder = useThemeToken("muted-foreground");
  const rest = useThemeToken("input");
  const active = useThemeToken("ring");
  const error = useThemeToken("destructive");
  let border = rest;
  if (focused) {
    border = active;
  }
  if (invalid) {
    border = error;
  }
  return { border, placeholder };
};
export interface FieldKeyboardOptions {
  adjustPosition?: boolean;
  avoidKeyboard?: boolean;
  keyboardMode?: "lift" | "dock";
  cursorSpacing?: number;
  keyboardOffset?: number;
  keyboardBottomInset?: number;
}
export const fieldKeyboard = (
  props: FieldKeyboardOptions,
  state: { focused: boolean; keyboardHeight: number }
) => {
  const scale = getWindowInfo().windowWidth / 375;
  const mode = props.keyboardMode ?? "lift";
  let dock = 0;
  if (props.avoidKeyboard && mode === "dock" && state.focused) {
    dock = Math.max(
      0,
      state.keyboardHeight - (props.keyboardBottomInset ?? 0) * scale
    );
  }
  return {
    adjustPosition:
      props.adjustPosition ?? (!!props.avoidKeyboard && mode === "lift"),
    cursorSpacing: props.cursorSpacing ?? (props.keyboardOffset ?? 16) * scale,
    dockStyle: dock > 0 ? { transform: `translateY(${-dock}px)` } : undefined,
  };
};
