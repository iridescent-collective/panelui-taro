import { View } from "@tarojs/components";
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
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
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { AccordionBody } from "./Body";
import { accordionVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
export type AccordionVariant =
  | "default"
  | "surface"
  | "separated"
  | "bordered"
  | "ghost";
export type AccordionSelectionMode = "single" | "multiple";
const TRANSITION_DURATION = 200;
interface AccordionContextValue {
  expanded: string[];
  toggle: (value: string) => void;
  variant: AccordionVariant;
  keepMounted: boolean;
}
interface AccordionItemContextValue {
  value: string;
  isExpanded: boolean;
  isDisabled: boolean;
}
const AccordionContext = createContext<AccordionContextValue | null>(null);
const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null
);
const useAccordion = (component: string): AccordionContextValue => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error(`${component} must be used within an <Accordion>`);
  }
  return context;
};
const useAccordionItem = (component: string): AccordionItemContextValue => {
  const context = useContext(AccordionItemContext);
  if (!context) {
    throw new Error(`${component} must be used within an <Accordion.Item>`);
  }
  return context;
};
export interface AccordionProps extends ViewProps {
  className?: string;
  variant?: AccordionVariant;
  selectionMode?: AccordionSelectionMode;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  hideSeparator?: boolean;
  keepMounted?: boolean;
  children?: ReactNode;
}
const toArray = (value: string | string[] | undefined): string[] => {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
};
const AccordionRoot = forwardRef<ComponentRef<typeof View>, AccordionProps>(
  (
    {
      className,
      variant = "default",
      selectionMode = "single",
      value,
      defaultValue,
      onValueChange,
      hideSeparator = false,
      keepMounted = false,
      children,
      ...props
    },
    ref
  ) => {
    const [internal, setInternal] = useState<string[]>(() =>
      toArray(defaultValue)
    );
    const isControlled = value !== undefined;
    const expanded = isControlled ? toArray(value) : internal;
    const toggle = useCallback(
      (itemValue: string) => {
        const isOpen = expanded.includes(itemValue);
        let next = isOpen
          ? expanded.filter((entry) => entry !== itemValue)
          : [...expanded, itemValue];
        if (selectionMode === "single") {
          next = isOpen ? [] : [itemValue];
        }
        if (!isControlled) {
          setInternal(next);
        }
        onValueChange?.(selectionMode === "single" ? (next[0] ?? "") : next);
      },
      [expanded, selectionMode, isControlled, onValueChange]
    );
    const context = useMemo(
      () => ({ expanded, keepMounted, toggle, variant }),
      [expanded, toggle, variant, keepMounted]
    );
    const { root, separator } = accordionVariants({ variant });
    const items = Children.toArray(children).filter(isValidElement);
    return (
      <AccordionContext.Provider value={context}>
        <View ref={ref} className={root({ className })} {...props}>
          {items.map((child, index) => (
            <View key={child.key ?? index}>
              {child}
              {!hideSeparator && index < items.length - 1 ? (
                <View className={separator()} />
              ) : null}
            </View>
          ))}
        </View>
      </AccordionContext.Provider>
    );
  }
);
AccordionRoot.displayName = "Accordion";
export interface AccordionItemProps extends ViewProps {
  className?: string;
  value: string;
  isDisabled?: boolean;
  children?: ReactNode;
}
const AccordionItem = forwardRef<ComponentRef<typeof View>, AccordionItemProps>(
  ({ className, value, isDisabled = false, children, ...props }, ref) => {
    const { expanded, variant } = useAccordion("Accordion.Item");
    const isExpanded = expanded.includes(value);
    const { item } = accordionVariants({ variant });
    const context = useMemo(
      () => ({ isDisabled, isExpanded, value }),
      [value, isExpanded, isDisabled]
    );
    return (
      <AccordionItemContext.Provider value={context}>
        <View ref={ref} className={item({ className })} {...props}>
          {textChildren(children)}
        </View>
      </AccordionItemContext.Provider>
    );
  }
);
AccordionItem.displayName = "Accordion.Item";
export interface AccordionTriggerProps extends Omit<
  PressableProps,
  "children"
> {
  className?: string;
  children?: ReactNode;
}
const AccordionTrigger = forwardRef<
  ComponentRef<typeof View>,
  AccordionTriggerProps
>(({ className, children, onPress, disabled = false, ...props }, ref) => {
  const { toggle, variant } = useAccordion("Accordion.Trigger");
  const { value, isExpanded, isDisabled } =
    useAccordionItem("Accordion.Trigger");
  const { trigger, title } = accordionVariants({ variant });
  const triggerDisabled = Boolean(isDisabled || disabled);
  return (
    <AnimatedPressable
      pressScale={1}
      ref={ref}
      {...props}
      accessibilityRole="button"
      accessibilityState={{ disabled: triggerDisabled, expanded: isExpanded }}
      disabled={triggerDisabled}
      className={trigger({ className })}
      onPress={(event) => {
        onPress?.(event);
        toggle(value);
      }}
    >
      {textChildren(children, (text) => (
        <Text className={title()}>{text}</Text>
      ))}
    </AnimatedPressable>
  );
});
AccordionTrigger.displayName = "Accordion.Trigger";
export interface AccordionIndicatorProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const AccordionIndicator = forwardRef<
  ComponentRef<typeof View>,
  AccordionIndicatorProps
>(({ className, children, ...props }, ref) => {
  const { variant } = useAccordion("Accordion.Indicator");
  const { isExpanded } = useAccordionItem("Accordion.Indicator");
  const { indicator } = accordionVariants({ variant });
  const reducedMotion = usePanelReducedMotion();
  const style = {
    transform: `rotate(${isExpanded ? 180 : 0}deg)`,
    transition: reducedMotion
      ? "none"
      : `transform ${TRANSITION_DURATION}ms ease-in-out`,
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
AccordionIndicator.displayName = "Accordion.Indicator";
export interface AccordionContentProps extends ViewProps {
  className?: string;
  keepMounted?: boolean;
  children?: ReactNode;
}
const AccordionContent = forwardRef<
  ComponentRef<typeof View>,
  AccordionContentProps
>(({ className, keepMounted, children, ...props }, ref) => {
  const { variant, keepMounted: keepMountedDefault } =
    useAccordion("Accordion.Content");
  const { isExpanded } = useAccordionItem("Accordion.Content");
  const { content, contentText } = accordionVariants({ variant });
  return (
    <AccordionBody
      ref={ref}
      open={isExpanded}
      keepMounted={keepMounted ?? keepMountedDefault}
      className={content({ className })}
      {...props}
    >
      {textChildren(children, (text) => (
        <Text className={contentText()}>{text}</Text>
      ))}
    </AccordionBody>
  );
});
AccordionContent.displayName = "Accordion.Content";
const AccordionTitle = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => {
    const { variant } = useAccordion("Accordion.Title");
    const { title } = accordionVariants({ variant });
    return <Text ref={ref} className={title({ className })} {...props} />;
  }
);
AccordionTitle.displayName = "Accordion.Title";
export const Accordion = Object.assign(AccordionRoot, {
  Content: AccordionContent,
  Indicator: AccordionIndicator,
  Item: AccordionItem,
  Title: AccordionTitle,
  Trigger: AccordionTrigger,
});
