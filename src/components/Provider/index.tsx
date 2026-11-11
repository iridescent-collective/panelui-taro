import { View } from "@tarojs/components";
import { useEffect } from "react";
import type { ComponentProps, ReactNode } from "react";

import { ReducedMotionContext } from "../../hooks/use-reduced-motion";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import {
  PortalProvider,
  useModalIsolationActive,
} from "../../primitives/portal";
import { connectSystemTheme } from "../../theme/store";
import { useTheme, useThemeStyles } from "../../theme/use-theme";
import { ToastViewport } from "../Toast/viewport";

export { usePanelReducedMotion } from "../../hooks/use-reduced-motion";

export interface PanelUIProviderProps extends ComponentProps<typeof View> {
  active?: boolean;
  reducedMotion?: boolean;
  background?: boolean;
  statusBarTranslucent?: boolean;
  navigationBarTranslucent?: boolean;
}

const ProviderContent = ({ children }: { children?: ReactNode }) => {
  const active = useModalIsolationActive();
  return (
    <View
      aria-hidden={active}
      data-panelui-content
      className={cn(
        "flex min-w-0 flex-1 flex-col",
        active && "panelui-modal-isolated"
      )}
      style={{ pointerEvents: active ? "none" : "auto" }}
    >
      {children}
    </View>
  );
};

export const PanelUIProvider = ({
  active = true,
  reducedMotion = false,
  background = true,
  statusBarTranslucent: _statusBarTranslucent,
  navigationBarTranslucent: _navigationBarTranslucent,
  className,
  children,
  style,
  ...props
}: PanelUIProviderProps) => {
  const { theme } = useTheme();
  const themeStyle = useThemeStyles();
  useEffect(connectSystemTheme, []);
  return (
    <PortalProvider active={active}>
      <ReducedMotionContext.Provider value={reducedMotion}>
        <View
          {...props}
          style={mergeStyle(themeStyle, style)}
          className={cn(
            "flex min-w-0 flex-col",
            "panelui-theme",
            `panelui-theme--${theme}`,
            !background && "panelui-background-transparent",
            reducedMotion && "panelui-reduced-motion",
            className
          )}
        >
          <ProviderContent>{children}</ProviderContent>
          {active ? <ToastViewport /> : null}
        </View>
      </ReducedMotionContext.Provider>
    </PortalProvider>
  );
};
