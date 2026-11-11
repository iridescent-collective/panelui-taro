import { View } from "@tarojs/components";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode, ComponentProps, ComponentRef } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { ChevronDownIcon } from "../../icons";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import type { AnimatedPressableProps as PressableProps } from "../../primitives/animated-pressable";
import { Collapse } from "../../primitives/collapse";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { collapsibleVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
export type CollapsibleVariant = "default" | "surface" | "ghost";
const INDICATOR_DURATION = 200;
interface CollapsibleContextValue {
  open: boolean;
  toggle: () => void;
  isDisabled: boolean;
  variant: CollapsibleVariant;
}
const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);
const useCollapsible = (component: string): CollapsibleContextValue => {
  const context = useContext(CollapsibleContext);
  if (!context) {
    throw new Error(`${component} must be used within a <Collapsible>`);
  }
  return context;
};
export interface CollapsibleProps extends ViewProps {
  className?: string;
  variant?: CollapsibleVariant;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isDisabled?: boolean;
  children?: ReactNode;
}
const CollapsibleRoot = forwardRef<ComponentRef<typeof View>, CollapsibleProps>(
  (
    {
      className,
      variant = "default",
      open,
      defaultOpen = false,
      onOpenChange,
      isDisabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const [internal, setInternal] = useState(defaultOpen);
    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internal;
    const toggle = useCallback(() => {
      const next = !isOpen;
      if (!isControlled) {
        setInternal(next);
      }
      onOpenChange?.(next);
    }, [isOpen, isControlled, onOpenChange]);
    const context = useMemo(
      () => ({ isDisabled, open: isOpen, toggle, variant }),
      [isOpen, toggle, isDisabled, variant]
    );
    const { root } = collapsibleVariants({ variant });
    return (
      <CollapsibleContext.Provider value={context}>
        <View ref={ref} className={root({ className })} {...props}>
          {children}
        </View>
      </CollapsibleContext.Provider>
    );
  }
);
CollapsibleRoot.displayName = "Collapsible";
export interface CollapsibleTriggerProps extends Omit<
  PressableProps,
  "children"
> {
  className?: string;
  children?: ReactNode;
}
const CollapsibleTrigger = forwardRef<
  ComponentRef<typeof View>,
  CollapsibleTriggerProps
>(({ className, children, onPress, ...props }, ref) => {
  const { open, toggle, isDisabled, variant } = useCollapsible(
    "Collapsible.Trigger"
  );
  const { trigger, title } = collapsibleVariants({ variant });
  return (
    <AnimatedPressable
      pressScale={1}
      ref={ref}
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, expanded: open }}
      disabled={isDisabled}
      className={trigger({ className })}
      onPress={(event) => {
        onPress?.(event);
        toggle();
      }}
    >
      {textChildren(children, (text) => (
        <Text className={title()}>{text}</Text>
      ))}
    </AnimatedPressable>
  );
});
CollapsibleTrigger.displayName = "Collapsible.Trigger";
const CollapsibleTitle = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => {
    const { variant } = useCollapsible("Collapsible.Title");
    const { title } = collapsibleVariants({ variant });
    return <Text ref={ref} className={title({ className })} {...props} />;
  }
);
CollapsibleTitle.displayName = "Collapsible.Title";
export interface CollapsibleIndicatorProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const CollapsibleIndicator = forwardRef<
  ComponentRef<typeof View>,
  CollapsibleIndicatorProps
>(({ className, children, ...props }, ref) => {
  const { open, variant } = useCollapsible("Collapsible.Indicator");
  const { indicator } = collapsibleVariants({ variant });
  const reducedMotion = usePanelReducedMotion();
  const style = {
    transform: `rotate(${open ? 180 : 0}deg)`,
    transition: reducedMotion
      ? "none"
      : `transform ${INDICATOR_DURATION}ms ease-in-out`,
  };
  return (
    <View style={style}>
      <View
        ref={ref}
        className={indicator({ className: `flex flex-col ${className ?? ""}` })}
        {...props}
      >
        {children ?? <ChevronDownIcon size={18} />}
      </View>
    </View>
  );
});
CollapsibleIndicator.displayName = "Collapsible.Indicator";
export interface CollapsibleContentProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const CollapsibleContent = forwardRef<
  ComponentRef<typeof View>,
  CollapsibleContentProps
>(({ className, children, ...props }, ref) => {
  const { open, variant } = useCollapsible("Collapsible.Content");
  const { content, contentText } = collapsibleVariants({ variant });
  return (
    <Collapse open={open} className={content({ className })}>
      <View ref={ref} aria-hidden={!open} className="flex flex-col" {...props}>
        {textChildren(children, (text) => (
          <Text className={contentText()}>{text}</Text>
        ))}
      </View>
    </Collapse>
  );
});
CollapsibleContent.displayName = "Collapsible.Content";
export const Collapsible = Object.assign(CollapsibleRoot, {
  Content: CollapsibleContent,
  Indicator: CollapsibleIndicator,
  Title: CollapsibleTitle,
  Trigger: CollapsibleTrigger,
});
