import { useMemo, useState } from "react";

import { useControllableState } from "../../primitives/controllable-state";
import { FeedbackContext } from "./context";
import type { FeedbackProps } from "./types";

export const FeedbackRoot = ({
  children,
  open,
  onOpenChange,
  defaultOpen = false,
  value,
  defaultValue = "",
  onValueChange,
}: FeedbackProps) => {
  const disclosure = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: open,
  });
  const input = useControllableState({
    defaultValue,
    onChange: onValueChange,
    value,
  });
  const [fieldValue, setFieldValue] = useState<string>();
  const context = useMemo(
    () => ({
      fieldValue,
      open: disclosure.value,
      setFieldValue,
      setOpen: disclosure.setValue,
      setValue: input.setValue,
      value: input.value,
    }),
    [
      disclosure.value,
      disclosure.setValue,
      input.value,
      input.setValue,
      fieldValue,
    ]
  );
  return (
    <FeedbackContext.Provider value={context}>
      {children}
    </FeedbackContext.Provider>
  );
};
