export const requestRadioValueChange = (
  currentValue: string | undefined,
  nextValue: string,
  onValueChange: (value: string) => void
): void => {
  if (currentValue !== nextValue) {
    onValueChange(nextValue);
  }
};
