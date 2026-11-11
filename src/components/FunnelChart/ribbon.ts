export const ribbonPath = (
  offset: number,
  length: number,
  head: number,
  tail: number,
  middle: number,
  curve: number
): string => {
  if (length <= 0 || (head <= 0 && tail <= 0)) {
    return "";
  }
  const start = offset;
  const end = offset + length;
  const topStart = middle - head;
  const topEnd = middle - tail;
  const bottomStart = middle + head;
  const bottomEnd = middle + tail;
  if (!(curve > 0)) {
    return `M${start},${topStart}L${end},${topEnd}L${end},${bottomEnd}L${start},${bottomStart}Z`;
  }
  const near = start + length * curve;
  const far = end - length * curve;
  return (
    `M${start},${topStart}` +
    `C${near},${topStart},${far},${topEnd},${end},${topEnd}` +
    `L${end},${bottomEnd}` +
    `C${far},${bottomEnd},${near},${bottomStart},${start},${bottomStart}` +
    `Z`
  );
};
