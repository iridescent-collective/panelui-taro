import { View } from "@tarojs/components";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronDownIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { Collapse } from "../../primitives/collapse";
import { Text } from "../primitives/Text";
import { useSources } from "./context";
import type { SourcesTriggerProps, SourcesContentProps } from "./types";
import { sourcesVariants } from "./variants";

export const SourcesTrigger = ({
  className,
  count = 0,
  children,
  onPress,
  onClick,
  ...props
}: SourcesTriggerProps) => {
  const { open, setOpen } = useSources("Sources.Trigger");
  const { trigger, triggerLabel } = sourcesVariants();
  const reduced = usePanelReducedMotion();
  return (
    <AnimatedPressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onClick={(event) => {
        (onClick ?? onPress)?.(event);
        setOpen(!open);
      }}
      className={cn(trigger(), className)}
    >
      {children ?? (
        <>
          <Text className={triggerLabel()}>
            Used {count} {count === 1 ? "source" : "sources"}
          </Text>
          <View
            style={{
              transform: `rotate(${open ? 180 : 0}deg)`,
              transition: reduced ? "none" : "transform 180ms ease",
            }}
          >
            <ChevronDownIcon size={16} />
          </View>
        </>
      )}
    </AnimatedPressable>
  );
};
export const SourcesContent = ({
  className,
  children,
  ...props
}: SourcesContentProps) => {
  const { open } = useSources("Sources.Content");
  const { content } = sourcesVariants();
  return (
    <Collapse
      open={open}
      className={cn("flex flex-col", content(), className)}
      {...props}
    >
      {children}
    </Collapse>
  );
};
