export const sortCopy = <T>(
  values: readonly T[],
  compare: (left: T, right: T) => number
): T[] => {
  const copy = [...values];
  copy.sort(compare);
  return copy;
};
