export const deferred = <T>() => {
  let complete: ((value: T) => void) | undefined;
  let fail: ((reason: unknown) => void) | undefined;
  const promise = new Promise<T>((resolve, reject) => {
    complete = resolve;
    fail = reject;
  });
  return {
    promise,
    reject: (reason: unknown) => fail?.(reason),
    resolve: (value: T) => complete?.(value),
  };
};
