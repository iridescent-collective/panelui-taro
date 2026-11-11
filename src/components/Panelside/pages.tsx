import { View } from "@tarojs/components";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useState,
} from "react";

import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken as usePanelsideToken } from "../../theme/use-theme";
import { textChildren } from "../primitives/Text";
import { usePanelsideContext } from "./context";
import { Glyph, Menu01Icon } from "./glyph";
import type {
  PanelsidePagesProps,
  PanelsidePageProps,
  PanelsideTriggerProps,
  PanelsidePressableProps,
} from "./types";

export const PanelsidePage = ({
  className,
  value: _value,
  keepAlive: _keepAlive,
  hidden = false,
  children,
  style,
  ...props
}: PanelsidePageProps) => (
  <View
    aria-hidden={hidden}
    style={mergeStyleAfter(style, {
      display: hidden ? "none" : undefined,
      pointerEvents: hidden ? "none" : undefined,
    })}
    className={cn("flex flex-1 flex-col", className)}
    {...props}
  >
    {textChildren(children)}
  </View>
);
export const PanelsidePages = ({
  className,
  children,
  ...props
}: PanelsidePagesProps) => {
  const { route } = usePanelsideContext("Panelside.Pages");
  const [visited, setVisited] = useState<readonly string[]>(() => [route]);
  useEffect(() => {
    setVisited((current) =>
      current.includes(route) ? current : [...current, route]
    );
  }, [route]);
  return (
    <View className={cn("flex flex-1 flex-col", className)} {...props}>
      {Children.map(children, (child) => {
        if (
          !isValidElement<PanelsidePageProps>(child) ||
          child.type !== PanelsidePage
        ) {
          return child;
        }
        const { value, keepAlive = true } = child.props;
        const current = value === route;
        if (!current && (!keepAlive || !visited.includes(value))) {
          return null;
        }
        return cloneElement(child, { hidden: !current });
      })}
    </View>
  );
};
export const PanelsideTrigger = ({
  className,
  label = "Open navigation panel",
  children,
  onPress,
  onClick,
  ...props
}: PanelsideTriggerProps) => {
  const { toggle, docked } = usePanelsideContext("Panelside.Trigger");
  const tint = usePanelsideToken("foreground");
  const color = typeof tint === "string" ? tint : undefined;
  if (docked) {
    return null;
  }
  if (children && isValidElement(children)) {
    const press = (...args: unknown[]) => {
      (children.props.onClick ?? children.props.onPress)?.(...args);
      (onClick ?? onPress)?.(
        args[0] as Parameters<
          NonNullable<PanelsidePressableProps["onPress"]>
        >[0]
      );
      toggle();
    };
    return cloneElement(children, { onClick: press, onPress: press });
  }
  return (
    <AnimatedPressable
      {...props}
      onPress={(event) => {
        (onClick ?? onPress)?.(event);
        toggle();
      }}
      className={cn(
        "flex h-[80px] w-[80px] flex-col items-center justify-center rounded-full",
        className
      )}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Glyph icon={Menu01Icon} size={20} color={color} />
    </AnimatedPressable>
  );
};
