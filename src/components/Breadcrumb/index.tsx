import { View } from "@tarojs/components";
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
} from "react";
import type { ComponentProps, ComponentRef, ReactNode } from "react";

import { ChevronRightIcon, EllipsisIcon } from "../../icons";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { crumbText } from "./variants";

type ViewProps = ComponentProps<typeof View>;

type BreadcrumbSize = "sm" | "default";

const BreadcrumbContext = createContext<{
  size: BreadcrumbSize;
  separator: ReactNode;
}>({
  separator: null,
  size: "default",
});
const useBreadcrumb = () => useContext(BreadcrumbContext);
export interface BreadcrumbProps extends ViewProps {
  className?: string;
  size?: BreadcrumbSize;
  separator?: ReactNode;
  children?: ReactNode;
}
const BreadcrumbRoot = forwardRef<ComponentRef<typeof View>, BreadcrumbProps>(
  ({ className, size = "default", separator, children, ...props }, ref) => (
    <BreadcrumbContext.Provider value={{ separator: separator ?? null, size }}>
      <View
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("w-full", className)}
        {...props}
      >
        {textChildren(children)}
      </View>
    </BreadcrumbContext.Provider>
  )
);
BreadcrumbRoot.displayName = "Breadcrumb";
export interface BreadcrumbListProps extends ViewProps {
  className?: string;
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
  onEllipsisPress?: () => void;
  children?: ReactNode;
}
const COLLAPSE = Symbol("breadcrumb-collapse");
export interface BreadcrumbSeparatorProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const BreadcrumbSeparator = forwardRef<
  ComponentRef<typeof View>,
  BreadcrumbSeparatorProps
>(({ className, children, ...props }, ref) => {
  const { separator } = useBreadcrumb();
  const rawTint = useThemeToken("muted-foreground");
  const tint = typeof rawTint === "string" ? rawTint : undefined;
  const glyph = children ?? separator;
  return (
    <View
      ref={ref}
      aria-hidden
      className={cn("flex items-center justify-center", className)}
      {...props}
    >
      {glyph ?? <ChevronRightIcon size={14} color={tint} />}
    </View>
  );
});
BreadcrumbSeparator.displayName = "Breadcrumb.Separator";
export interface BreadcrumbEllipsisProps extends Omit<
  AnimatedPressableProps,
  "children"
> {
  className?: string;
}
const BreadcrumbEllipsis = forwardRef<
  ComponentRef<typeof View>,
  BreadcrumbEllipsisProps
>(({ className, onPress, ...props }, ref) => {
  const rawTint = useThemeToken("muted-foreground");
  const tint = typeof rawTint === "string" ? rawTint : undefined;
  const glyph = <EllipsisIcon size={16} color={tint} />;
  if (!onPress) {
    return (
      <View
        ref={ref}
        {...(props as ViewProps)}
        aria-label="More"
        className={cn(
          "flex h-[40px] items-center justify-center px-[4px]",
          className
        )}
      >
        {glyph}
      </View>
    );
  }
  return (
    <AnimatedPressable
      ref={ref}
      {...props}
      accessibilityRole="button"
      accessibilityLabel="Show more"
      pressScale={0.92}
      onPress={onPress}
      className={cn(
        "flex h-[40px] items-center justify-center px-[4px]",
        className
      )}
    >
      {glyph}
    </AnimatedPressable>
  );
});
BreadcrumbEllipsis.displayName = "Breadcrumb.Ellipsis";
const crumbKey = (node: ReactNode | typeof COLLAPSE, position: number) => {
  if (node === COLLAPSE) {
    return "panelui-collapsed";
  }
  if (isValidElement(node) && node.key !== null) {
    return node.key;
  }
  return `crumb-${position}`;
};
const BreadcrumbList = forwardRef<
  ComponentRef<typeof View>,
  BreadcrumbListProps
>(
  (
    {
      className,
      maxItems,
      itemsBeforeCollapse = 1,
      itemsAfterCollapse = 1,
      onEllipsisPress,
      children,
      ...props
    },
    ref
  ) => {
    const crumbs = Children.toArray(children).filter(isValidElement);
    let sequence: (ReactNode | typeof COLLAPSE)[] = crumbs;
    if (
      maxItems !== undefined &&
      crumbs.length > maxItems &&
      itemsBeforeCollapse + itemsAfterCollapse < crumbs.length
    ) {
      const head = crumbs.slice(0, Math.max(0, itemsBeforeCollapse));
      const tail =
        itemsAfterCollapse > 0
          ? crumbs.slice(crumbs.length - itemsAfterCollapse)
          : [];
      sequence = [...head, COLLAPSE, ...tail];
    }
    return (
      <View
        ref={ref}
        role="list"
        aria-role="list"
        className={cn(
          "flex flex-row flex-wrap items-center gap-[12px]",
          className
        )}
        {...props}
      >
        {sequence.map((node, i) => (
          <View
            key={crumbKey(node, i)}
            className="flex flex-row items-center gap-[12px]"
          >
            {i > 0 ? <BreadcrumbSeparator /> : null}
            {node === COLLAPSE ? (
              <BreadcrumbEllipsis onPress={onEllipsisPress} />
            ) : (
              node
            )}
          </View>
        ))}
      </View>
    );
  }
);
BreadcrumbList.displayName = "Breadcrumb.List";
export interface BreadcrumbItemProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const BreadcrumbItem = forwardRef<
  ComponentRef<typeof View>,
  BreadcrumbItemProps
>(({ className, children, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex flex-row items-center", className)}
    {...props}
  >
    {textChildren(children)}
  </View>
));
BreadcrumbItem.displayName = "Breadcrumb.Item";
export interface BreadcrumbLinkProps extends Omit<
  AnimatedPressableProps,
  "children"
> {
  className?: string;
  textClassName?: string;
  children?: ReactNode;
}
const BreadcrumbLink = forwardRef<
  ComponentRef<typeof View>,
  BreadcrumbLinkProps
>(({ className, textClassName, children, ...props }, ref) => {
  const { size } = useBreadcrumb();
  return (
    <AnimatedPressable
      ref={ref}
      accessibilityRole="link"
      pressScale={1}
      pressOpacity={0.6}
      className={cn("flex flex-row items-center", className)}
      {...props}
    >
      {textChildren(children, (text) => (
        <Text
          className={crumbText({
            className: cn(
              "text-[color:var(--panel-muted-foreground)]",
              textClassName
            ),
            size,
          })}
        >
          {text}
        </Text>
      ))}
    </AnimatedPressable>
  );
});
BreadcrumbLink.displayName = "Breadcrumb.Link";
export interface BreadcrumbPageProps extends TextProps {
  className?: string;
}
const BreadcrumbPage = forwardRef<
  ComponentRef<typeof Text>,
  BreadcrumbPageProps
>(({ className, ...props }, ref) => {
  const { size } = useBreadcrumb();
  return (
    <Text
      ref={ref}
      aria-current="page"
      role="text"
      aria-role="text"
      weight="medium"
      className={crumbText({
        className: cn("text-[color:var(--panel-foreground)]", className),
        size,
      })}
      {...props}
    />
  );
});
BreadcrumbPage.displayName = "Breadcrumb.Page";
export const Breadcrumb = Object.assign(BreadcrumbRoot, {
  Ellipsis: BreadcrumbEllipsis,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  List: BreadcrumbList,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
});
