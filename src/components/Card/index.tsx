import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef, ComponentProps } from "react";

import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { footerVariants } from "./variants";

export type CardProps = ComponentProps<typeof View>;
export interface CardFooterProps extends CardProps {
  variant?: "plain" | "panel";
}

const CardRoot = forwardRef<ComponentRef<typeof View>, CardProps>(
  ({ className, children, ...props }: CardProps, ref) => (
    <View
      ref={ref}
      {...props}
      className={cn(
        "rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-card)] shadow-sm",
        className
      )}
    >
      {textChildren(children)}
    </View>
  )
);
const CardHeader = forwardRef<ComponentRef<typeof View>, CardProps>(
  ({ className, children, ...props }: CardProps, ref) => (
    <View
      ref={ref}
      {...props}
      className={cn("flex flex-col gap-[12px] p-[48px]", className)}
    >
      {textChildren(children)}
    </View>
  )
);
const CardTitle = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }: TextProps, ref) => (
    <Text
      ref={ref}
      size="lg"
      weight="semibold"
      {...props}
      className={cn(
        "leading-[1.25] text-[color:var(--panel-card-foreground)]",
        className
      )}
    />
  )
);
const CardDescription = forwardRef<ComponentRef<typeof Text>, TextProps>(
  (props: TextProps, ref) => <Text ref={ref} size="sm" muted {...props} />
);
const CardContent = forwardRef<ComponentRef<typeof View>, CardProps>(
  ({ className, children, ...props }: CardProps, ref) => (
    <View
      ref={ref}
      {...props}
      className={cn("flex flex-col p-[48px] pt-0", className)}
    >
      {textChildren(children)}
    </View>
  )
);
const CardFooter = forwardRef<ComponentRef<typeof View>, CardFooterProps>(
  (
    { variant = "plain", className, children, ...props }: CardFooterProps,
    ref
  ) => (
    <View
      ref={ref}
      {...props}
      className={footerVariants({ className, variant })}
    >
      {textChildren(children)}
    </View>
  )
);

export const Card = Object.assign(CardRoot, {
  Content: CardContent,
  Description: CardDescription,
  Footer: CardFooter,
  Header: CardHeader,
  Title: CardTitle,
});
