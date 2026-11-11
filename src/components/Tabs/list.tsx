import { ScrollView, View } from "@tarojs/components";
import { getWindowInfo } from "@tarojs/taro";
import { useEffect, useMemo, useRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { cn } from "../../lib/utils";
import { textChildren } from "../primitives/Text";
import { TabsListContext, useTabs } from "./context";
import { TabsIndicator } from "./indicator";
import type { TabsListProps } from "./types";
import { useRowLayouts } from "./use-row-layouts";
import { tabsVariants } from "./variants";

export const TabsList = ({
  className,
  scrollable = false,
  indicatorClassName,
  children,
  ...props
}: TabsListProps) => {
  const { variant, value, layouts, registerLayout, animationDisabled } =
    useTabs("Tabs.List");
  const row = useElementLayout(true, children, props.id);
  const measured = useRowLayouts(row.id, registerLayout);
  const context = useMemo(
    () => ({ registerTrigger: measured.registerTrigger, scrollable }),
    [measured.registerTrigger, scrollable]
  );
  useEffect(() => {
    measured.refresh();
    if (variant !== "expanding" || animationDisabled) {
      return;
    }
    const timer = setTimeout(measured.refresh, 260);
    return () => clearTimeout(timer);
  }, [
    value,
    children,
    variant,
    animationDisabled,
    measured.refresh,
    row.layout?.width,
  ]);
  const settled = useRef(false);
  useEffect(() => {
    if (layouts[value]) {
      settled.current = true;
    }
  }, [layouts, value]);
  const target =
    (Math.max((layouts[value]?.x ?? 24) - 24, 0) *
      getWindowInfo().windowWidth) /
    375;
  const content = (
    <TabsListContext.Provider value={context}>
      <View
        {...props}
        id={row.id}
        role="tablist"
        aria-role="tablist"
        className={cn(
          "relative",
          tabsVariants({ variant }).list(),
          scrollable && "w-max",
          className
        )}
      >
        {variant === "expanding" ? null : (
          <TabsIndicator className={indicatorClassName} />
        )}
        {textChildren(children)}
      </View>
    </TabsListContext.Provider>
  );
  if (!scrollable) {
    return content;
  }
  return (
    <ScrollView
      scrollX
      enhanced
      showScrollbar={false}
      scrollLeft={target}
      scrollWithAnimation={settled.current && !animationDisabled}
      className="shrink-0"
    >
      {content}
    </ScrollView>
  );
};
