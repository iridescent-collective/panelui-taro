import { View } from "@tarojs/components";
import { useMemo } from "react";

import { textChildren } from "../primitives/Text";
import { ToastContext } from "./context";
import type { ToastProps } from "./types";
import { toastVariants } from "./variants";

export const ToastRoot = ({
  className,
  variant = "default",
  onHide,
  children,
  ...props
}: ToastProps) => {
  const context = useMemo(
    () => ({ hide: onHide ?? (() => false), variant }),
    [variant, onHide]
  );
  return (
    <ToastContext.Provider value={context}>
      <View
        {...props}
        role="alert"
        aria-role="alert"
        aria-live="polite"
        className={toastVariants({ variant }).root({ className })}
      >
        {textChildren(children)}
      </View>
    </ToastContext.Provider>
  );
};
ToastRoot.displayName = "Toast";
