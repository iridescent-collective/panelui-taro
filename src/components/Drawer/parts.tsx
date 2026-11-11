import { ScrollView, View } from "@tarojs/components";
import { useContext } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";
import { DrawerSurfaceContext } from "./context";
import type {
  DrawerHeaderProps,
  DrawerBodyProps,
  DrawerFooterProps,
} from "./types";

export const DrawerHeader = ({
  className,
  title,
  description,
  children,
  ...props
}: DrawerHeaderProps) => {
  const surface = useContext(DrawerSurfaceContext);
  let clearance: string | undefined;
  if (surface?.showClose) {
    clearance = surface.closeSide === "start" ? "ps-[112px]" : "pe-[112px]";
  }
  return (
    <View
      {...props}
      className={cn(
        "flex flex-col gap-[8px] px-[40px] pb-[24px]",
        clearance,
        className
      )}
    >
      {typeof title === "string" ? (
        <Text size="lg" weight="semibold">
          {title}
        </Text>
      ) : (
        title
      )}
      {typeof description === "string" ? (
        <Text size="sm" muted>
          {description}
        </Text>
      ) : (
        description
      )}
      {textChildren(children)}
    </View>
  );
};
export const DrawerBody = ({
  className,
  scrollable = true,
  children,
  contentContainerStyle,
  ...props
}: DrawerBodyProps) =>
  scrollable ? (
    <ScrollView
      scrollY
      enhanced
      showScrollbar={false}
      {...props}
      className={cn("panel-drawer-body h-0 min-h-0 flex-1", className)}
    >
      <View
        className="flex flex-col"
        style={mergeStyle(
          { paddingLeft: "40rpx", paddingRight: "40rpx" },
          contentContainerStyle
        )}
      >
        {textChildren(children)}
      </View>
    </ScrollView>
  ) : (
    <View className={cn("flex min-h-0 flex-1 flex-col px-[40px]", className)}>
      {textChildren(children)}
    </View>
  );
export const DrawerFooter = ({
  className,
  children,
  ...props
}: DrawerFooterProps) => (
  <View
    {...props}
    className={cn(
      "flex flex-row items-center gap-[16px] border-t-[2px] border-solid border-[var(--panel-border)] px-[40px] pt-[24px]",
      className
    )}
  >
    {textChildren(children)}
  </View>
);
