import { View } from "@tarojs/components";
import { forwardRef, useCallback, useEffect, useState } from "react";
import type { ComponentProps, ComponentRef } from "react";

import { usePanelReducedMotion } from "../../../hooks/use-reduced-motion";
import { mergeStyle } from "../../../lib/styles";
import { cn } from "../../../lib/utils";
import { Collapse } from "../../../primitives/collapse";

export interface AccordionBodyProps extends ComponentProps<typeof View> {
  open: boolean;
  keepMounted: boolean;
}
export const AccordionBody = forwardRef<
  ComponentRef<typeof View>,
  AccordionBodyProps
>(({ open, keepMounted, children, className, style, ...props }, ref) => {
  const reducedMotion = usePanelReducedMotion();
  const [retained, setRetained] = useState(open);
  useEffect(() => {
    if (open) setRetained(true);
  }, [open]);
  const finishExit = useCallback(() => setRetained(false), []);
  const visible = open || (retained && !reducedMotion);
  return (
    <Collapse open={open} fade={false} onExitComplete={finishExit}>
      {visible || keepMounted ? (
        <View
          {...props}
          ref={ref}
          className={cn("flex flex-col", className)}
          aria-hidden={!open}
          style={mergeStyle(visible ? {} : { visibility: "hidden" }, style)}
        >
          {children}
        </View>
      ) : null}
    </Collapse>
  );
});
