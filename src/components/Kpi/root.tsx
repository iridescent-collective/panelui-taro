import { View } from "@tarojs/components";
import { forwardRef, useMemo } from "react";
import type { ComponentRef } from "react";

import { Surface } from "../Surface";
import { KpiContext } from "./context";
import type { KpiProps } from "./types";
import { kpiVariants } from "./variants";

export const KpiRoot = forwardRef<ComponentRef<typeof View>, KpiProps>(
  (
    {
      className,
      colorIndex = 1,
      goodDirection = "up",
      surface = true,
      children,
      ...props
    },
    ref
  ) => {
    const { root } = kpiVariants();
    const context = useMemo(
      () => ({ colorIndex, goodDirection }),
      [colorIndex, goodDirection]
    );
    const body = (
      <View
        ref={surface ? undefined : ref}
        className={root({ className })}
        {...props}
      >
        {children}
      </View>
    );
    return (
      <KpiContext.Provider value={context}>
        {surface ? (
          <Surface
            ref={ref}
            variant="secondary"
            padding="lg"
            className="w-full"
          >
            {body}
          </Surface>
        ) : (
          body
        )}
      </KpiContext.Provider>
    );
  }
);
KpiRoot.displayName = "Kpi";
