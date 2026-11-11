import { Text as TaroText } from "@tarojs/components";
import { forwardRef, Children } from "react";
import type {
  AriaRole,
  ComponentRef,
  ComponentProps,
  ReactElement,
  ReactNode,
} from "react";

import { useDirection } from "../../../hooks/use-direction";
import { mergeStyle } from "../../../lib/styles";
import { cn } from "../../../lib/utils";
import { TEXT_SIZE, TEXT_WEIGHT } from "./constants";
import { paragraphStyle } from "./paragraph-style";

export interface TextProps extends ComponentProps<typeof TaroText> {
  role?: AriaRole;
  "aria-role"?: AriaRole;
  size?: keyof typeof TEXT_SIZE;
  weight?: keyof typeof TEXT_WEIGHT;
  muted?: boolean;
  nativeID?: string;
  onPress?: TextProps["onClick"];
  numberOfLines?: number;
  ellipsizeMode?: "head" | "middle" | "tail" | "clip";
}

export const Text = forwardRef<ComponentRef<typeof TaroText>, TextProps>(
  (
    {
      size = "base",
      weight = "normal",
      muted,
      className,
      style,
      nativeID,
      id,
      onPress,
      onClick,
      numberOfLines,
      ellipsizeMode,
      ...props
    }: TextProps,
    ref
  ) => {
    const direction = useDirection();
    return (
      <TaroText
        ref={ref}
        {...props}
        id={id ?? nativeID}
        onClick={onClick ?? onPress}
        aria-role={props["aria-role"] ?? props.role}
        style={mergeStyle(
          { direction, ...paragraphStyle(numberOfLines, ellipsizeMode) },
          style
        )}
        className={cn(
          "leading-[1.5] text-[color:var(--panel-foreground)]",
          TEXT_SIZE[size],
          TEXT_WEIGHT[weight],
          muted && "text-[color:var(--panel-muted-foreground)]",
          className
        )}
      />
    );
  }
);

export const textChildren = (
  children: ReactNode,
  render: (value: string | number) => ReactElement = (value) => (
    <Text>{value}</Text>
  )
): ReactNode =>
  Children.map(children, (child) =>
    typeof child === "string" || typeof child === "number"
      ? render(child)
      : child
  );

export const textLabel = (children: ReactNode): string | undefined => {
  const parts = Children.toArray(children);
  return parts.length > 0 &&
    parts.every((part) => typeof part === "string" || typeof part === "number")
    ? parts.join("").trim() || undefined
    : undefined;
};
