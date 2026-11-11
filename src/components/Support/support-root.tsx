import { View } from "@tarojs/components";
import { forwardRef, useMemo } from "react";
import type { ComponentRef } from "react";

import { textChildren } from "../primitives/Text";
import { SupportContext } from "./context";
import type { SupportProps } from "./types";
import { supportVariants } from "./variants";

export const SupportRoot = forwardRef<ComponentRef<typeof View>, SupportProps>(
  ({ className, availability = "online", children, ...props }, ref) => {
    const { root } = supportVariants();
    const context = useMemo(() => ({ availability }), [availability]);
    return (
      <SupportContext.Provider value={context}>
        <View ref={ref} className={root({ className })} {...props}>
          {textChildren(children)}
        </View>
      </SupportContext.Provider>
    );
  }
);
SupportRoot.displayName = "Support";
