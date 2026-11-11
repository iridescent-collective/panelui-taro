import { View } from "@tarojs/components";
import { forwardRef } from "react";
import type { ComponentRef } from "react";

import { IconColorProvider } from "../../icons";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { PageHeaderRowContext, usePageHeader } from "./context";
import type {
  PageHeaderRowProps,
  PageHeaderContentProps,
  PageHeaderActionsProps,
  PageHeaderMetaProps,
} from "./types";
import { pageHeaderVariants } from "./variants";

export const PageHeaderRow = forwardRef<
  ComponentRef<typeof View>,
  PageHeaderRowProps
>(({ className, children, style, ...props }, ref) => {
  const { variant, align, navigationRowHeight } =
    usePageHeader("PageHeader.Row");
  return (
    <View
      {...props}
      ref={ref}
      className={pageHeaderVariants({ align, variant }).row({ className })}
      style={
        navigationRowHeight === undefined
          ? style
          : mergeStyle(
              {
                minHeight: `${navigationRowHeight}px`,
              },
              style
            )
      }
    >
      <PageHeaderRowContext.Provider value>
        {children}
      </PageHeaderRowContext.Provider>
    </View>
  );
});
export const PageHeaderContent = forwardRef<
  ComponentRef<typeof View>,
  PageHeaderContentProps
>(({ className, children, ...props }, ref) => {
  const { variant, align } = usePageHeader("PageHeader.Content");
  return (
    <View
      {...props}
      ref={ref}
      className={cn(
        pageHeaderVariants({ align, variant }).content(),
        "flex flex-col",
        className
      )}
    >
      {textChildren(children)}
    </View>
  );
});
export const PageHeaderTitle = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      {...props}
      ref={ref}
      size="xl"
      weight="semibold"
      role="heading"
      aria-role="heading"
      className={cn("text-[color:var(--panel-foreground)]", className)}
    />
  )
);
export const PageHeaderDescription = forwardRef<
  ComponentRef<typeof Text>,
  TextProps
>(({ className, ...props }, ref) => (
  <Text {...props} ref={ref} size="sm" muted className={className} />
));
export const PageHeaderMeta = forwardRef<
  ComponentRef<typeof View>,
  PageHeaderMetaProps
>(({ className, icon, children, ...props }, ref) => {
  const { variant, align } = usePageHeader("PageHeader.Meta");
  const muted = useThemeToken("muted-foreground");
  return (
    <View
      {...props}
      ref={ref}
      className={pageHeaderVariants({ align, variant }).meta({ className })}
    >
      {icon ? (
        <IconColorProvider color={muted}>{icon}</IconColorProvider>
      ) : null}
      {textChildren(children, (text) => (
        <Text size="sm" muted>
          {text}
        </Text>
      ))}
    </View>
  );
});
export const PageHeaderActions = forwardRef<
  ComponentRef<typeof View>,
  PageHeaderActionsProps
>(({ className, children, ...props }, ref) => {
  const { variant, align } = usePageHeader("PageHeader.Actions");
  return (
    <View
      {...props}
      ref={ref}
      className={pageHeaderVariants({ align, variant }).actions({ className })}
    >
      {textChildren(children)}
    </View>
  );
});
