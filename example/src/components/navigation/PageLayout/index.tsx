import { View } from "@tarojs/components";
import { PanelUIProvider } from "panelui-taro/provider";
import { ScrollArea } from "panelui-taro/scroll-area";
import { Surface } from "panelui-taro/surface";
import { clsx as cn } from "clsx";
import type { CSSProperties, ReactNode } from "react";

import { useNativeTheme } from "@/services/native-theme";

export interface PageLayoutProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  className?: string;
  style?: CSSProperties;
  bodyClassName?: string | false;
}
const PageLayoutBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <ScrollArea
    className="h-0 min-h-0 flex-1"
    contentContainerClassName={cn("flex min-h-full flex-col", className)}
  >
    {children}
  </ScrollArea>
);

export const PageLayout = ({
  children,
  header,
  footer,
  className,
  style,
  bodyClassName,
}: PageLayoutProps) => {
  useNativeTheme();
  return (
    <PanelUIProvider className="h-screen">
      <Surface
        padding="none"
        variant="transparent"
        className={cn(
          "flex h-screen min-h-0 flex-col overflow-hidden rounded-none",
          className
        )}
        style={style}
      >
        {header ? <View className="shrink-0">{header}</View> : null}
        {bodyClassName === false ? (
          <View className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </View>
        ) : (
          <PageLayoutBody className={bodyClassName ?? undefined}>
            {children}
          </PageLayoutBody>
        )}
        {footer}
      </Surface>
    </PanelUIProvider>
  );
};
