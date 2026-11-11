import { View } from "@tarojs/components";
import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useContext,
  useMemo,
} from "react";
import type { ReactNode, ComponentProps, ComponentRef } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import type { AnimatedPressableProps } from "../../primitives/animated-pressable";
import type { VariantProps } from "../../vendor/tailwind-variants/lite";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import { gridPlacements, gridTracks } from "./layout";
import type { GridSpan } from "./layout";
import { gridItemVariants, mediaVariants } from "./variants";

type ViewProps = ComponentProps<typeof View>;
type GridItemSize = "default" | "sm";

const GridItemContext = createContext<{
  size: GridItemSize;
}>({ size: "default" });
export interface GridItemGroupProps extends ViewProps {
  className?: string;
  columns?: number;
  gap?: number;
  aspect?: number;
  rowHeight?: number;
  size?: GridItemSize;
  children?: ReactNode;
}
const GridItemGroup = forwardRef<ComponentRef<typeof View>, GridItemGroupProps>(
  (
    {
      className,
      columns = 2,
      gap = 12,
      aspect = 1,
      rowHeight,
      size = "default",
      children,
      style,
      ...props
    },
    ref
  ) => {
    const layout = useElementLayout(
      rowHeight === undefined,
      children,
      props.id
    );
    const width = layout.layout?.width ?? 0;
    const tracks = gridTracks(columns);
    const track = (width - gap * (tracks - 1)) / tracks;
    const cell = rowHeight ?? track / (aspect || 1);
    const { placements, rows } = useMemo(
      () =>
        gridPlacements(
          Children.toArray(children)
            .filter((child) => isValidElement<GridSpan>(child))
            .map((child) => child.props as GridSpan),
          tracks
        ),
      [children, tracks]
    );
    const positioned = rowHeight !== undefined || width > 0;
    const height = rows > 0 ? rows * cell + gap * (rows - 1) : 0;
    let index = -1;
    return (
      <GridItemContext.Provider value={{ size }}>
        <View
          ref={ref}
          id={layout.id}
          role="list"
          aria-role="list"
          style={mergeStyle(
            { height: positioned ? `${height * 2}rpx` : undefined },
            style
          )}
          className={cn("relative w-full", className)}
          {...props}
        >
          {positioned
            ? Children.map(children, (child) => {
                if (!isValidElement(child)) {
                  return null;
                }
                index += 1;
                const place = placements[index];
                if (!place) {
                  return null;
                }
                return (
                  <View
                    style={{
                      height: `${(place.rowSpan * cell + (place.rowSpan - 1) * gap) * 2}rpx`,
                      left: `calc(${(place.column / tracks) * 100}% + ${(place.column * gap * 2) / tracks}rpx)`,
                      position: "absolute",
                      top: `${place.row * (cell + gap) * 2}rpx`,
                      width: `calc(${(place.colSpan / tracks) * 100}% - ${((tracks - place.colSpan) * gap * 2) / tracks}rpx)`,
                    }}
                  >
                    {child}
                  </View>
                );
              })
            : null}
        </View>
      </GridItemContext.Provider>
    );
  }
);
GridItemGroup.displayName = "GridItem.Group";
export interface GridItemProps
  extends
    Omit<AnimatedPressableProps, "children" | "disabled">,
    Omit<VariantProps<typeof gridItemVariants>, "disabled" | "size"> {
  className?: string;
  disabled?: boolean;
  colSpan?: number;
  rowSpan?: number;
  children?: ReactNode;
}
const GridItemRoot = forwardRef<ComponentRef<typeof View>, GridItemProps>(
  (
    {
      className,
      variant,
      disabled,
      children,
      onPress,
      colSpan: _colSpan,
      rowSpan: _rowSpan,
      ...props
    },
    ref
  ) => {
    const { size } = useContext(GridItemContext);
    const { root } = gridItemVariants({ disabled: !!disabled, size, variant });
    if (!onPress) {
      return (
        <View
          ref={ref}
          {...(props as ViewProps)}
          aria-disabled={!!disabled}
          className={root({
            className: `relative flex flex-col ${className ?? ""}`,
          })}
        >
          {textChildren(children)}
        </View>
      );
    }
    return (
      <AnimatedPressable
        ref={ref}
        {...props}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={onPress}
        className={root({
          className: `relative flex flex-col ${className ?? ""}`,
        })}
      >
        {textChildren(children)}
      </AnimatedPressable>
    );
  }
);
GridItemRoot.displayName = "GridItem";
export interface GridItemBackgroundProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const GridItemBackground = forwardRef<
  ComponentRef<typeof View>,
  GridItemBackgroundProps
>(({ className, children, style, ...props }, ref) => (
  <View
    ref={ref}
    aria-hidden
    style={mergeStyle(
      {
        bottom: 0,
        left: 0,
        pointerEvents: "none",
        position: "absolute",
        right: 0,
        top: 0,
      },
      style
    )}
    className={cn("overflow-hidden", className)}
    {...props}
  >
    {textChildren(children)}
  </View>
));
GridItemBackground.displayName = "GridItem.Background";
export interface GridItemMediaProps
  extends ViewProps, VariantProps<typeof mediaVariants> {
  className?: string;
  children?: ReactNode;
}
const GridItemMedia = forwardRef<ComponentRef<typeof View>, GridItemMediaProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    const grid = useContext(GridItemContext);
    return (
      <View
        ref={ref}
        className={mediaVariants({
          className: `flex ${className ?? ""}`,
          size: size ?? grid.size,
          variant,
        })}
        {...props}
      >
        {textChildren(children)}
      </View>
    );
  }
);
GridItemMedia.displayName = "GridItem.Media";
export interface GridItemTitleProps extends TextProps {
  className?: string;
}
const GridItemTitle = forwardRef<ComponentRef<typeof Text>, GridItemTitleProps>(
  ({ className, ...props }, ref) => {
    const { size } = useContext(GridItemContext);
    const { title } = gridItemVariants({ size });
    return <Text ref={ref} className={title({ className })} {...props} />;
  }
);
GridItemTitle.displayName = "GridItem.Title";
export interface GridItemValueProps extends TextProps {
  className?: string;
}
const GridItemValue = forwardRef<ComponentRef<typeof Text>, GridItemValueProps>(
  ({ className, ...props }, ref) => {
    const { size } = useContext(GridItemContext);
    const { value } = gridItemVariants({ size });
    return <Text ref={ref} className={value({ className })} {...props} />;
  }
);
GridItemValue.displayName = "GridItem.Value";
export interface GridItemDescriptionProps extends TextProps {
  className?: string;
}
const GridItemDescription = forwardRef<
  ComponentRef<typeof Text>,
  GridItemDescriptionProps
>(({ className, ...props }, ref) => {
  const { size } = useContext(GridItemContext);
  const { description } = gridItemVariants({ size });
  return <Text ref={ref} className={description({ className })} {...props} />;
});
GridItemDescription.displayName = "GridItem.Description";
export interface GridItemFooterProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const GridItemFooter = forwardRef<
  ComponentRef<typeof View>,
  GridItemFooterProps
>(({ className, children, ...props }, ref) => (
  <View
    ref={ref}
    className={cn(
      "mt-auto flex w-full flex-row items-center gap-[16px]",
      className
    )}
    {...props}
  >
    {textChildren(children)}
  </View>
));
GridItemFooter.displayName = "GridItem.Footer";
export interface GridItemActionsProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
const GridItemActions = forwardRef<
  ComponentRef<typeof View>,
  GridItemActionsProps
>(({ className, children, ...props }, ref) => (
  <View
    ref={ref}
    className={cn("flex shrink-0 flex-row items-center gap-[12px]", className)}
    {...props}
  >
    {textChildren(children)}
  </View>
));
GridItemActions.displayName = "GridItem.Actions";
export const GridItem = Object.assign(GridItemRoot, {
  Actions: GridItemActions,
  Background: GridItemBackground,
  Description: GridItemDescription,
  Footer: GridItemFooter,
  Group: GridItemGroup,
  Media: GridItemMedia,
  Title: GridItemTitle,
  Value: GridItemValue,
});
