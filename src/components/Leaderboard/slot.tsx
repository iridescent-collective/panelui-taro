import { View } from "@tarojs/components";
import { Children, cloneElement, isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../lib/utils";

export const LeaderboardSlot = ({
  onPress,
  label,
  className,
  children,
  style,
}: {
  onPress?: () => void;
  label: string;
  className?: string;
  children: ReactNode;
  style?: ComponentProps<typeof View>["style"];
}) => (
  <View
    role={onPress ? "button" : "group"}
    aria-role={onPress ? "button" : "text"}
    aria-label={label}
    onClick={onPress}
    style={style}
    className={cn("flex flex-col", className, onPress && "active:opacity-70")}
  >
    {Children.map(children, (child) =>
      isValidElement<Record<string, unknown>>(child)
        ? cloneElement(child, { "aria-hidden": true })
        : child
    )}
  </View>
);
