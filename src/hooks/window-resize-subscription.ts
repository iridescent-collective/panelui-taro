import { offWindowResize, onWindowResize } from "@tarojs/taro";

const listeners = new Set<() => void>();

const notify = () => {
  const subscribers = [...listeners];
  for (const listener of subscribers) {
    listener();
  }
};

export const subscribeWindowResize = (listener: () => void) => {
  const subscriber = () => listener();
  if (listeners.size === 0) {
    onWindowResize(notify);
  }
  listeners.add(subscriber);
  return () => {
    if (listeners.delete(subscriber) && listeners.size === 0) {
      offWindowResize(notify);
    }
  };
};
