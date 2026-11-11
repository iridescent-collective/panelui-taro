const cubic = (t: number, first: number, second: number) =>
  3 * (1 - t) ** 2 * t * first + 3 * (1 - t) * t ** 2 * second + t ** 3;
export const stackExitEase = (progress: number) => {
  let low = 0;
  let high = 1;
  for (let iteration = 0; iteration < 24; iteration += 1) {
    const current = (low + high) / 2;
    if (cubic(current, 0.33, 0.4) < progress) {
      low = current;
    } else {
      high = current;
    }
  }
  return cubic((low + high) / 2, 0.66, 1);
};
