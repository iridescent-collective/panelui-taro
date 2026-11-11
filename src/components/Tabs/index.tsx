import { View } from "@tarojs/components";
import { useCallback, useMemo, useState } from "react";

import { cn } from "../../lib/utils";
import { useControllableState } from "../../primitives/controllable-state";
import { textChildren } from "../primitives/Text";
import { collectPanels } from "./collect-panels";
import { TabsContent } from "./content";
import { TabsContext } from "./context";
import { TabsList } from "./list";
import { TabsPager } from "./pager";
import { TabsTrigger } from "./trigger";
import type { TabsProps, TabLayout } from "./types";

export type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
  TabsVariant,
  TabsSize,
  TabsKeepMounted,
  TabsAnimation,
} from "./types";
const TabsRoot = ({
  className,
  value,
  onValueChange,
  defaultValue,
  variant = "segmented",
  size = "md",
  keepMounted = false,
  swipeable = false,
  animation,
  children,
  ...props
}: TabsProps) => {
  const { value: active, setValue } = useControllableState({
    defaultValue,
    onChange: onValueChange,
    value,
  });
  const [layouts, setLayouts] = useState<Record<string, TabLayout>>({});
  const registerLayout = useCallback(
    (tab: string, layout: TabLayout) =>
      setLayouts((current) => {
        const existing = current[tab];
        return existing?.x === layout.x && existing.width === layout.width
          ? current
          : { ...current, [tab]: layout };
      }),
    []
  );
  const unregisterLayout = useCallback(
    (tab: string) =>
      setLayouts((current) => {
        if (!(tab in current)) {
          return current;
        }
        const { [tab]: _removed, ...next } = current;
        return next;
      }),
    []
  );
  const { rest, panels } = useMemo(() => collectPanels(children), [children]);
  const paged = swipeable && panels.length > 0;
  const animationDisabled = animation === "disable-all";
  const context = useMemo(
    () => ({
      animationDisabled,
      keepMounted,
      layouts,
      pager: paged,
      registerLayout,
      setValue,
      size,
      unregisterLayout,
      value: active,
      variant,
    }),
    [
      animationDisabled,
      keepMounted,
      layouts,
      paged,
      registerLayout,
      setValue,
      size,
      unregisterLayout,
      active,
      variant,
    ]
  );
  return (
    <TabsContext.Provider value={context}>
      <View {...props} className={cn("flex flex-col gap-[24px]", className)}>
        {textChildren(paged ? rest : children)}
        {paged ? (
          <TabsPager
            panels={panels}
            value={active}
            setValue={setValue}
            keepMounted={Boolean(keepMounted)}
            animationDisabled={animationDisabled}
          />
        ) : null}
      </View>
    </TabsContext.Provider>
  );
};
export const Tabs = Object.assign(TabsRoot, {
  Content: TabsContent,
  List: TabsList,
  Trigger: TabsTrigger,
});
