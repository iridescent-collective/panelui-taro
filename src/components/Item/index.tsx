import { View } from "@tarojs/components";
import { createContext, forwardRef, useContext } from "react";
import type { ReactNode, ComponentProps, ComponentRef } from "react";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";

import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { itemVariants, mediaVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
type ItemSize = "default" | "sm" | "xs";
type ItemOrientation = "horizontal" | "vertical";

const ItemContext = createContext<{
  size: ItemSize;
  orientation: ItemOrientation;
}>({
  orientation: "horizontal",
  size: "default",
});

export interface ItemProps
  extends
    Omit<AnimatedPressableProps, "children" | "disabled">,
    Omit<VariantProps<typeof itemVariants>, "disabled"> {
  className?: string;
  disabled?: boolean;

  size?: ItemSize;

  orientation?: ItemOrientation;
  children?: ReactNode;
}

const ItemRoot = forwardRef<ComponentRef<typeof View>, ItemProps>(
  (
    {
      className,
      variant,
      size = "default",
      orientation = "horizontal",
      disabled,
      children,
      onPress,
      onClick,
      ...props
    },
    ref
  ) => {
    const { root } = itemVariants({
      disabled: !!disabled,
      orientation,
      size,
      variant,
    });

    const activate = onClick ?? onPress;
    const body = activate ? (
      <AnimatedPressable
        ref={ref}
        {...props}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={activate}
        className={root({ className })}
      >
        {textChildren(children)}
      </AnimatedPressable>
    ) : (
      <View
        ref={ref}
        {...(props as ViewProps)}
        aria-disabled={!!disabled}
        className={root({ className })}
      >
        {textChildren(children)}
      </View>
    );

    return (
      <ItemContext.Provider value={{ orientation, size }}>
        {body}
      </ItemContext.Provider>
    );
  }
);
ItemRoot.displayName = "Item";

export interface ItemGroupProps extends ViewProps {
  className?: string;

  orientation?: ItemOrientation;
  children?: ReactNode;
}

const ItemGroup = forwardRef<ComponentRef<typeof View>, ItemGroupProps>(
  ({ className, orientation = "vertical", children, ...props }, ref) => (
    <View
      ref={ref}
      role="list"
      aria-role="list"
      className={cn(
        orientation === "horizontal"
          ? "flex flex-row items-stretch gap-[24px]"
          : "flex w-full flex-col",
        className
      )}
      {...props}
    >
      {textChildren(children)}
    </View>
  )
);
ItemGroup.displayName = "Item.Group";

export interface ItemSeparatorProps extends ViewProps {
  className?: string;

  orientation?: ItemOrientation;
}

const ItemSeparator = forwardRef<ComponentRef<typeof View>, ItemSeparatorProps>(
  ({ className, orientation = "vertical", ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        orientation === "horizontal" ? "h-full w-[2px]" : "h-[2px] w-full",
        "bg-[var(--panel-border)]",
        className
      )}
      {...props}
    />
  )
);
ItemSeparator.displayName = "Item.Separator";

export interface ItemMediaProps
  extends ViewProps, VariantProps<typeof mediaVariants> {
  className?: string;
  children?: ReactNode;
}

const ItemMedia = forwardRef<ComponentRef<typeof View>, ItemMediaProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const item = useContext(ItemContext);

    return (
      <View
        ref={ref}
        className={mediaVariants({
          className: `flex ${className ?? ""}`,
          size: size ?? item.size,
          variant,
        })}
        {...props}
      >
        {textChildren(children)}
      </View>
    );
  }
);
ItemMedia.displayName = "Item.Media";

export interface ItemContentProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}

const ItemContent = forwardRef<ComponentRef<typeof View>, ItemContentProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation } = useContext(ItemContext);

    return (
      <View
        ref={ref}
        className={cn(
          orientation === "horizontal" ? "flex-1" : "flex w-full flex-col",
          "flex flex-col gap-[4px]",
          className
        )}
        {...props}
      >
        {textChildren(children)}
      </View>
    );
  }
);
ItemContent.displayName = "Item.Content";

export interface ItemTitleProps extends TextProps {
  className?: string;
}

const ItemTitle = forwardRef<ComponentRef<typeof Text>, ItemTitleProps>(
  ({ className, ...props }, ref) => {
    const { size } = useContext(ItemContext);
    const { title } = itemVariants({ size });

    return <Text ref={ref} className={title({ className })} {...props} />;
  }
);
ItemTitle.displayName = "Item.Title";

export interface ItemDescriptionProps extends TextProps {
  className?: string;
}

const ItemDescription = forwardRef<
  ComponentRef<typeof Text>,
  ItemDescriptionProps
>(({ className, ...props }, ref) => {
  const { size } = useContext(ItemContext);
  const { description } = itemVariants({ size });

  return <Text ref={ref} className={description({ className })} {...props} />;
});
ItemDescription.displayName = "Item.Description";

export interface ItemActionsProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}

const ItemActions = forwardRef<ComponentRef<typeof View>, ItemActionsProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex shrink-0 flex-row items-center gap-[12px]",
        className
      )}
      {...props}
    >
      {textChildren(children)}
    </View>
  )
);
ItemActions.displayName = "Item.Actions";

export interface ItemHeaderProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}

const ItemHeader = forwardRef<ComponentRef<typeof View>, ItemHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(
        "flex w-full flex-row items-center justify-between gap-[16px]",
        className
      )}
      {...props}
    >
      {textChildren(children)}
    </View>
  )
);
ItemHeader.displayName = "Item.Header";

export interface ItemFooterProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}

const ItemFooter = forwardRef<ComponentRef<typeof View>, ItemFooterProps>(
  ({ className, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn("flex w-full flex-row items-center gap-[16px]", className)}
      {...props}
    >
      {textChildren(children)}
    </View>
  )
);
ItemFooter.displayName = "Item.Footer";

export const Item = Object.assign(ItemRoot, {
  Actions: ItemActions,
  Content: ItemContent,
  Description: ItemDescription,
  Footer: ItemFooter,
  Group: ItemGroup,
  Header: ItemHeader,
  Media: ItemMedia,
  Separator: ItemSeparator,
  Title: ItemTitle,
});
