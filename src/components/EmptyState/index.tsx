import { View } from "@tarojs/components";
import { createContext, forwardRef, useContext } from "react";
import type { ComponentProps, ComponentRef, ReactNode } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { emptyStateVariants, mediaVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
type RNText = ComponentRef<typeof Text>;

type EmptyStateSize = "sm" | "default" | "lg";
const EmptyStateContext = createContext<{
  size: EmptyStateSize;
}>({ size: "default" });

export interface EmptyStateProps
  extends ViewProps, VariantProps<typeof emptyStateVariants> {
  className?: string;
  variant?: "default" | "card";
  size?: EmptyStateSize;
  children?: ReactNode;
}
const EmptyStateRoot = forwardRef<ComponentRef<typeof View>, EmptyStateProps>(
  ({ className, variant, size = "default", ...props }, ref) => {
    const { root } = emptyStateVariants({ size, variant });
    return (
      <EmptyStateContext.Provider value={{ size }}>
        <View
          ref={ref}
          className={root({ className: `flex flex-col ${className ?? ""}` })}
          {...props}
        />
      </EmptyStateContext.Provider>
    );
  }
);
EmptyStateRoot.displayName = "EmptyState";
const EmptyStateHeader = forwardRef<ComponentRef<typeof View>, EmptyStateProps>(
  ({ className, ...props }, ref) => {
    const { header } = emptyStateVariants();
    return (
      <View
        ref={ref}
        className={header({ className: `flex flex-col ${className ?? ""}` })}
        {...props}
      />
    );
  }
);
EmptyStateHeader.displayName = "EmptyState.Header";
export interface EmptyStateMediaProps
  extends ViewProps, VariantProps<typeof mediaVariants> {
  className?: string;
  children?: ReactNode;
}
const EmptyStateMedia = forwardRef<
  ComponentRef<typeof View>,
  EmptyStateMediaProps
>(({ className, variant = "default", children, ...props }, ref) => {
  const { size } = useContext(EmptyStateContext);
  const { wrapper, card, ghost } = mediaVariants({ size, variant });
  return (
    <View
      ref={ref}
      className={wrapper({
        className: `relative mb-[32px] flex flex-col ${className ?? ""}`,
      })}
      {...props}
    >
      {variant === "icon" ? (
        <>
          <View
            aria-hidden
            className={`${ghost()} -translate-x-[16px] scale-90 -rotate-[10deg]`}
          />
          <View
            aria-hidden
            className={`${ghost()} translate-x-[16px] scale-90 rotate-[10deg]`}
          />
        </>
      ) : null}
      <View className={card({ className: "flex flex-col" })}>
        {textChildren(children)}
      </View>
    </View>
  );
});
EmptyStateMedia.displayName = "EmptyState.Media";
const EmptyStateTitle = forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => {
    const { size } = useContext(EmptyStateContext);
    const { title } = emptyStateVariants({ size });
    return <Text ref={ref} className={title({ className })} {...props} />;
  }
);
EmptyStateTitle.displayName = "EmptyState.Title";
const EmptyStateDescription = forwardRef<RNText, TextProps>(
  ({ className, ...props }, ref) => {
    const { size } = useContext(EmptyStateContext);
    const { description } = emptyStateVariants({ size });
    return <Text ref={ref} className={description({ className })} {...props} />;
  }
);
EmptyStateDescription.displayName = "EmptyState.Description";
const EmptyStateContent = forwardRef<
  ComponentRef<typeof View>,
  ViewProps & {
    className?: string;
  }
>(({ className, ...props }, ref) => {
  const { content } = emptyStateVariants();
  return (
    <View
      ref={ref}
      className={content({ className: `flex flex-col ${className ?? ""}` })}
      {...props}
    />
  );
});
EmptyStateContent.displayName = "EmptyState.Content";
export const EmptyState = Object.assign(EmptyStateRoot, {
  Content: EmptyStateContent,
  Description: EmptyStateDescription,
  Header: EmptyStateHeader,
  Media: EmptyStateMedia,
  Title: EmptyStateTitle,
});
