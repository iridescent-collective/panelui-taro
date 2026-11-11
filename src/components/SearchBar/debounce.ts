export interface SearchBarDebounceTimer {
  current: ReturnType<typeof setTimeout> | null;
}

export const cancelSearchBarDebounce = (
  timer: SearchBarDebounceTimer
): void => {
  if (timer.current === null) {
    return;
  }
  clearTimeout(timer.current);
  timer.current = null;
};

export const scheduleSearchBarDebounce = (
  timer: SearchBarDebounceTimer,
  onDebouncedChange: ((value: string) => void) | undefined,
  value: string,
  delay: number
): void => {
  cancelSearchBarDebounce(timer);
  if (!Number.isFinite(delay) || delay <= 0) {
    onDebouncedChange?.(value);
    return;
  }
  timer.current = setTimeout(() => {
    timer.current = null;
    onDebouncedChange?.(value);
  }, delay);
};

export const flushSearchBarDebounce = (
  timer: SearchBarDebounceTimer,
  onDebouncedChange: ((value: string) => void) | undefined,
  value: string
): void => {
  cancelSearchBarDebounce(timer);
  onDebouncedChange?.(value);
};
