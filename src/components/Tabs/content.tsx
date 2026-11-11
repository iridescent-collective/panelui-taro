import { View } from "@tarojs/components";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import { useTabs } from "./context";
import type { TabsContentProps } from "./types";

export const TabsContent = ({
  className,
  value,
  children,
  style,
  ...props
}: TabsContentProps) => {
  const context = useTabs("Tabs.Content");
  const active = context.value === value;
  if (!context.pager && !active && !context.keepMounted) {
    return null;
  }
  const layout = context.pager
    ? { flexBasis: "auto", flexGrow: 1, flexShrink: 1, width: "100%" }
    : { display: active ? "flex" : "none" };
  return (
    <View
      {...props}
      role="tabpanel"
      aria-role="tabpanel"
      aria-hidden={!active}
      className={cn("flex min-w-0 flex-col", className)}
      style={mergeStyle(
        { ...layout, pointerEvents: active ? "auto" : "none" },
        style
      )}
    >
      {textChildren(children)}
    </View>
  );
};
