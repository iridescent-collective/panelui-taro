import { View } from "@tarojs/components";
import { Children, forwardRef, isValidElement, useMemo } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { PageHeaderAvatar } from "./avatar";
import {
  PageHeaderRow,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderMeta,
  PageHeaderActions,
} from "./content";
import { PageHeaderContext } from "./context";
import { PageHeaderCover } from "./cover";
import { usePageHeaderNavigation } from "./navigation";
import { PageHeaderNavigationLayout } from "./navigation-layout";
import { PageHeaderStats, PageHeaderStat } from "./stats";
import type { PageHeaderRootProps } from "./types";
import { pageHeaderVariants } from "./variants";

export { readPageHeaderNavigationMetrics } from "./navigation";
export type { PageHeaderNavigationMetrics } from "./navigation";

export type {
  PageHeaderProps,
  PageHeaderRootProps,
  PageHeaderVariant,
  PageHeaderAlign,
  PageHeaderCoverProps,
  PageHeaderAvatarProps,
  PageHeaderRowProps,
  PageHeaderContentProps,
  PageHeaderMetaProps,
  PageHeaderStatsLayout,
  PageHeaderStatsProps,
  PageHeaderStatProps,
  PageHeaderActionsProps,
} from "./types";

const PageHeaderRoot = forwardRef<
  ComponentRef<typeof View>,
  PageHeaderRootProps
>(
  (
    {
      className,
      style,
      id,
      variant = "card",
      align = "center",
      navigation = false,
      fixed = true,
      placeholder = true,
      safeAreaInsetTop = true,
      children,
      ...props
    },
    ref
  ) => {
    const metrics = usePageHeaderNavigation(navigation);
    const statusBarHeight = safeAreaInsetTop
      ? (metrics?.statusBarHeight ?? 0)
      : 0;
    const hasCover = Children.toArray(children).some(
      (child) => isValidElement(child) && child.type === PageHeaderCover
    );
    const context = useMemo(
      () => ({
        align,
        hasCover,
        variant,
        navigationRowHeight: metrics?.navRowHeight,
      }),
      [variant, align, hasCover, metrics?.navRowHeight]
    );
    const header = (
      <View
        {...props}
        ref={ref}
        id={id}
        style={style}
        className={cn(
          pageHeaderVariants({ align, variant }).root(),
          "flex flex-col",
          className
        )}
      >
        <PageHeaderContext.Provider value={context}>
          {metrics ? (
            <>
              <View
                className="panel-page-header-status-bar shrink-0"
                style={{ height: `${statusBarHeight}px` }}
                aria-hidden
              />
              <View
                className="panel-page-header-navigation-content box-border flex w-full flex-col"
                style={{
                  minHeight: `${metrics.navRowHeight}px`,
                  paddingRight: `${metrics.rightInset}px`,
                }}
              >
                {children}
              </View>
            </>
          ) : (
            children
          )}
        </PageHeaderContext.Provider>
      </View>
    );
    return navigation ? (
      <PageHeaderNavigationLayout
        fixed={fixed}
        placeholder={placeholder}
        fallbackHeight={statusBarHeight + (metrics?.navRowHeight ?? 0)}
      >
        {header}
      </PageHeaderNavigationLayout>
    ) : (
      header
    );
  }
);
export const PageHeader = Object.assign(PageHeaderRoot, {
  Actions: PageHeaderActions,
  Avatar: PageHeaderAvatar,
  Content: PageHeaderContent,
  Cover: PageHeaderCover,
  Description: PageHeaderDescription,
  Meta: PageHeaderMeta,
  Row: PageHeaderRow,
  Stat: PageHeaderStat,
  Stats: PageHeaderStats,
  Title: PageHeaderTitle,
});
