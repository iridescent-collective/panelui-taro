export interface ObservableValue<T> {
  value: T;
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
}
export const createObservableValue = <T>(initial: T): ObservableValue<T> => {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => value,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    get value() {
      return value;
    },
    set value(next: T) {
      if (Object.is(value, next)) {
        return;
      }
      value = next;
      for (const listener of listeners) {
        listener();
      }
    },
  };
};
