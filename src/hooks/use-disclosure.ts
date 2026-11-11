import { useCallback, useMemo } from "react";

import { useControllableState } from "../primitives/controllable-state";

export interface UseDisclosureOptions {
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}
export interface UseDisclosureResult {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  };
}
export const useDisclosure = ({
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
}: UseDisclosureOptions = {}): UseDisclosureResult => {
  const { value: isOpen, setValue: setOpen } = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: controlledOpen,
  });
  const open = useCallback(() => setOpen(true), [setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const toggle = useCallback(() => setOpen(!isOpen), [setOpen, isOpen]);
  return useMemo(
    () => ({
      close,
      isOpen,
      open,
      props: { onOpenChange: setOpen, open: isOpen },
      toggle,
    }),
    [isOpen, open, close, toggle, setOpen]
  );
};
