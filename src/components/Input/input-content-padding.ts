export const inputContentPadding = (
  width: number,
  present: boolean
): number | undefined =>
  present && width > 0 && Number.isFinite(width) ? width : undefined;
