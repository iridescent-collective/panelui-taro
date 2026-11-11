import {
  getWindowInfo,
  onKeyboardHeightChange,
  offKeyboardHeightChange,
} from "@tarojs/taro";

const listeners = new Set<() => void>();
let height = 0;
const update: Parameters<typeof onKeyboardHeightChange>[0] = (event) => {
  const next = Number.isFinite(event.height)
    ? Math.max(0, (event.height * 375) / getWindowInfo().windowWidth)
    : 0;
  if (height === next) {
    return;
  }
  height = next;
  for (const listener of listeners) {
    listener();
  }
};
export const subscribeKeyboard = (listener: () => void) => {
  if (listeners.size === 0) {
    onKeyboardHeightChange(update);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) {
      offKeyboardHeightChange(update);
      height = 0;
    }
  };
};
export const readKeyboardHeight = () => height;
