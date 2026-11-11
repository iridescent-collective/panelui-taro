import { Input, ScrollView, View } from "@tarojs/components";
import { useContext, useEffect } from "react";

import { useElementLayout } from "../../hooks/use-element-layout";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { withColorAlpha } from "../../lib/color";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren } from "../primitives/Text";
import { FOOTER_FADE } from "./constants";
import { PanelsideSurfaceContext } from "./context";
import { Glyph, Search01Icon } from "./glyph";
import type {
  PanelsideHeaderProps,
  PanelsideSearchProps,
  PanelsideContentProps,
  PanelsideFooterProps,
} from "./types";

const SurfaceFade = ({ rise, solid }: { rise: boolean; solid: string }) => (
  <View
    aria-hidden
    className={cn(
      "pointer-events-none absolute inset-x-0",
      rise ? "bottom-0" : "top-0"
    )}
    style={{
      background: `linear-gradient(to bottom, ${rise ? solid : withColorAlpha(solid, 0)}, ${rise ? withColorAlpha(solid, 0) : solid})`,
      height: `${FOOTER_FADE * 2}rpx`,
    }}
  />
);
export const PanelsideHeader = ({
  className,
  title,
  action,
  surface = "transparent",
  children,
  style,
  ...props
}: PanelsideHeaderProps) => {
  const { insets } = useWindowMetrics();
  const solid = useThemeToken("background");
  return (
    <View
      {...props}
      className={cn(
        "relative flex flex-col gap-[24px] px-[24px] pb-[24px]",
        surface === "solid" &&
          "border-b-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)]",
        className
      )}
      style={mergeStyle({ paddingTop: `${(insets.top + 12) * 2}rpx` }, style)}
    >
      {surface === "fade" ? (
        <>
          <View
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 bg-[var(--panel-background)]"
            style={{ bottom: `${FOOTER_FADE * 2}rpx` }}
          />
          <SurfaceFade rise solid={solid} />
        </>
      ) : null}
      {title || action ? (
        <View className="flex h-[72px] flex-row items-center justify-between gap-[16px]">
          {title ? (
            <Text
              size="xl"
              weight="semibold"
              numberOfLines={1}
              className="flex-1"
            >
              {title}
            </Text>
          ) : (
            <View className="flex-1" />
          )}
          {action}
        </View>
      ) : null}
      {textChildren(children)}
    </View>
  );
};
export const PanelsideSearch = ({
  className,
  containerClassName,
  placeholder = "Search",
  onChangeText,
  onInput,
  maxLength,
  autoFocus,
  editable,
  returnKeyType: _returnKeyType,
  clearButtonMode: _clearButtonMode,
  style,
  ...props
}: PanelsideSearchProps) => {
  const muted = useThemeToken("muted-foreground");
  const text = useThemeToken("foreground");
  return (
    <View
      className={cn(
        "flex h-[80px] flex-row items-center gap-[16px] rounded-[var(--panel-radius-xl)] bg-[var(--panel-secondary)] px-[24px]",
        containerClassName
      )}
    >
      <Glyph icon={Search01Icon} size={16} color={muted} />
      <Input
        {...props}
        placeholder={placeholder}
        placeholderStyle={`color:${muted};`}
        aria-label={props.ariaLabel ?? placeholder}
        aria-role="searchbox"
        confirmType="search"
        maxlength={maxLength ?? props.maxlength ?? -1}
        focus={autoFocus ?? props.focus}
        disabled={editable === false || props.disabled}
        className={cn(
          "h-full min-w-0 flex-1 text-[32px] font-normal text-[color:var(--panel-foreground)]",
          className
        )}
        style={mergeStyle({ color: text }, style)}
        onInput={(event) => {
          if (editable === false || props.disabled) {
            return;
          }
          onChangeText?.(event.detail.value);
          onInput?.(event);
        }}
      />
    </View>
  );
};
export const PanelsideContent = ({
  className,
  contentContainerClassName,
  contentContainerStyle,
  children,
  ...props
}: PanelsideContentProps) => {
  const surface = useContext(PanelsideSurfaceContext);
  return (
    <ScrollView
      {...props}
      scrollY
      enhanced
      showScrollbar={false}
      className={cn("min-h-0 flex-1", className)}
    >
      <View
        className={cn(
          "flex flex-col gap-[8px] px-[24px] pb-[24px]",
          contentContainerClassName
        )}
        style={mergeStyle(
          { paddingBottom: `${((surface?.footerHeight ?? 0) + 12) * 2}rpx` },
          contentContainerStyle
        )}
      >
        {textChildren(children)}
      </View>
    </ScrollView>
  );
};
export const PanelsideFooter = ({
  className,
  floating = true,
  surface = "transparent",
  children,
  style,
  ...props
}: PanelsideFooterProps) => {
  const { insets } = useWindowMetrics();
  const panel = useContext(PanelsideSurfaceContext);
  const measured = useElementLayout(floating, children, props.id, false);
  const solid = useThemeToken("background");
  const paint = floating ? surface : "solid";
  useEffect(() => {
    panel?.setFooterHeight(floating ? (measured.layout?.height ?? 0) : 0);
    return () => panel?.setFooterHeight(0);
  }, [floating, measured.layout?.height, panel?.setFooterHeight]);
  return (
    <View
      {...props}
      id={props.id ?? measured.id}
      className={cn(
        "relative flex flex-row items-center gap-[24px] px-[32px]",
        floating
          ? "absolute inset-x-0 bottom-0"
          : "border-t-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)] pt-[16px]",
        className
      )}
      style={mergeStyle(
        {
          paddingBottom: `${Math.max(insets.bottom, 12) * 2}rpx`,
          paddingTop: floating
            ? `${(paint === "fade" ? FOOTER_FADE : 12) * 2}rpx`
            : undefined,
        },
        style
      )}
    >
      {paint === "fade" ? (
        <>
          <SurfaceFade rise={false} solid={solid} />
          <View
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 bg-[var(--panel-background)]"
            style={{ top: `${FOOTER_FADE * 2}rpx` }}
          />
        </>
      ) : null}
      {paint === "solid" && floating ? (
        <View
          aria-hidden
          className="pointer-events-none absolute inset-0 border-t-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-background)]"
        />
      ) : null}
      {textChildren(children)}
    </View>
  );
};
