import { useSyncExternalStore } from "react";

import { readKeyboardHeight, subscribeKeyboard } from "./keyboard-store";

export interface UseKeyboardResult {
  height: number;
  isVisible: boolean;
}
export const useKeyboard = (): UseKeyboardResult => {
  const height = useSyncExternalStore(
    subscribeKeyboard,
    readKeyboardHeight,
    readKeyboardHeight
  );
  return { height, isVisible: height > 0 };
};
