import { View } from "@tarojs/components";
import { useMemo } from "react";

import { cn } from "../../lib/utils";
import { useControllableState } from "../../primitives/controllable-state";
import { SourcesContext } from "./context";
import { SourcesTrigger, SourcesContent } from "./parts";
import { SourcesSource } from "./source";
import type { SourcesProps } from "./types";
import { sourcesVariants } from "./variants";

export type {
  SourcesProps,
  SourcesTriggerProps,
  SourcesContentProps,
  SourcesSourceProps,
} from "./types";
const SourcesRoot = ({
  className,
  open,
  defaultOpen = false,
  onOpenChange,
  children,
  ...props
}: SourcesProps) => {
  const { root } = sourcesVariants();
  const { value, setValue } = useControllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: open,
  });
  const context = useMemo(
    () => ({ open: value, setOpen: setValue }),
    [value, setValue]
  );
  return (
    <SourcesContext.Provider value={context}>
      <View {...props} className={cn("flex flex-col", root(), className)}>
        {children}
      </View>
    </SourcesContext.Provider>
  );
};
export const Sources = Object.assign(SourcesRoot, {
  Content: SourcesContent,
  Source: SourcesSource,
  Trigger: SourcesTrigger,
});
