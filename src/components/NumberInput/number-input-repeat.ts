export interface Repeater {
  start: (step: () => boolean) => void;
  stop: () => void;
}
export const createRepeater = (delay: number, interval: number): Repeater => {
  let delayTimer: ReturnType<typeof setTimeout> | null = null;
  let intervalTimer: ReturnType<typeof setInterval> | null = null;
  let generation = 0;
  const stop = () => {
    generation += 1;
    if (delayTimer !== null) {
      clearTimeout(delayTimer);
    }
    if (intervalTimer !== null) {
      clearInterval(intervalTimer);
    }
    delayTimer = null;
    intervalTimer = null;
  };
  const start = (step: () => boolean) => {
    stop();
    const current = generation;
    if (!step()) {
      return;
    }
    delayTimer = setTimeout(() => {
      if (current !== generation) {
        return;
      }
      delayTimer = null;
      intervalTimer = setInterval(() => {
        if (current !== generation) {
          return;
        }
        if (!step()) {
          stop();
        }
      }, interval);
    }, delay);
  };
  return { start, stop };
};
