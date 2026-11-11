export const stepsTriggerDisabled = (
  itemDisabled: boolean,
  triggerDisabled: boolean | null | undefined
): boolean => itemDisabled || !!triggerDisabled;
