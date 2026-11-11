import { View } from "@tarojs/components";
import { forwardRef, useContext, useMemo } from "react";
import type { ComponentRef } from "react";

import { IconColorProvider } from "../../icons";
import { mergeStyle, mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Text, textChildren } from "../primitives/Text";
import type { TextProps } from "../primitives/Text";
import {
  HORIZONTAL_RAIL_TOP,
  HORIZONTAL_TICK_HEIGHT,
  SOLID_VARIANTS,
  TONE_NODE,
  PENDING_NODE,
  TONE_ICON_VAR,
} from "./constants";
import {
  TimelineItemContext,
  TimelineColumnOffsetContext,
  useTimeline,
  useTimelineItem,
  useColumnInk,
  useScrollValue,
  useTimelineToken,
} from "./context";
import { itemWidth, TIMELINE_WIDE_COLUMN } from "./geometry";
import type {
  TimelineItemProps,
  TimelineViewProps,
  TimelineIndicatorProps,
  TimelineStatProps,
  TimelineMastheadProps,
} from "./types";
import { timelineVariants } from "./variants";

export const TimelineItem = forwardRef<
  ComponentRef<typeof View>,
  TimelineItemProps
>(
  (
    {
      className,
      step,
      completed,
      tone = "default",
      last = false,
      width,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const { activeStep, variant, orientation, scrollX, animate, virtualized } =
      useTimeline("Timeline.Item");
    const columnOffset = useContext(TimelineColumnOffsetContext);
    const border = useTimelineToken("--color-border");
    const isCompleted = completed ?? step <= activeStep;
    const { item } = timelineVariants({
      completed: isCompleted,
      orientation,
      tone,
      variant,
    });
    const horizontal = orientation === "horizontal";
    const columnWidth = horizontal
      ? itemWidth({ children, step, width } as TimelineItemProps)
      : undefined;
    const offset = columnOffset ?? 0;
    const context = useMemo(
      () => ({
        columnWidth: columnWidth ?? 0,
        completed: isCompleted,
        offset,
        showSeparator: !last,
        step,
        tone,
      }),
      [step, isCompleted, tone, last, offset, columnWidth]
    );
    const scroll = useScrollValue(scrollX);
    const away = Math.min(
      1,
      Math.abs(scroll - offset) /
        Math.max(columnWidth ?? TIMELINE_WIDE_COLUMN, 1)
    );
    const columnStyle =
      horizontal && animate
        ? { transform: `scale(${1 - away * 0.04}) translateY(${away * 8}rpx)` }
        : {};
    if (!horizontal) {
      return (
        <TimelineItemContext.Provider value={context}>
          <View
            ref={ref}
            className={item({ className })}
            style={style}
            {...props}
          >
            {textChildren(children)}
          </View>
        </TimelineItemContext.Provider>
      );
    }
    return (
      <TimelineItemContext.Provider value={context}>
        <View
          ref={ref}
          className={item({ className })}
          {...props}
          style={mergeStyleAfter(style, {
            paddingTop: `${HORIZONTAL_RAIL_TOP * 2}rpx`,
            width: `${(columnWidth ?? 0) * 2}rpx`,
            ...columnStyle,
          })}
        >
          {virtualized && !last ? (
            <View
              aria-hidden
              style={{
                borderColor: typeof border === "string" ? border : undefined,
                borderStyle: "dashed",
                borderTopWidth: "2rpx",
                left: 0,
                position: "absolute",
                right: 0,
                top: `${HORIZONTAL_RAIL_TOP * 2}rpx`,
              }}
            />
          ) : null}
          {textChildren(children)}
        </View>
      </TimelineItemContext.Provider>
    );
  }
);
TimelineItem.displayName = "Timeline.Item";
export const TimelineAside = forwardRef<
  ComponentRef<typeof View>,
  TimelineViewProps & {
    className?: string;
  }
>(({ className, style, ...props }, ref) => {
  const { variant, orientation } = useTimeline("Timeline.Aside");
  const { aside } = timelineVariants({ orientation, variant });
  return (
    <View
      ref={ref}
      className={aside({ className })}
      style={
        orientation === "horizontal"
          ? mergeStyle(
              {
                height: `${HORIZONTAL_RAIL_TOP * 2}rpx`,
                marginTop: `${-HORIZONTAL_RAIL_TOP * 2}rpx`,
              },
              style
            )
          : style
      }
      {...props}
    />
  );
});
TimelineAside.displayName = "Timeline.Aside";
export const TimelineIndicator = forwardRef<
  ComponentRef<typeof View>,
  TimelineIndicatorProps
>(({ className, children, ...props }, ref) => {
  const { variant, orientation } = useTimeline("Timeline.Indicator");
  const { step, completed, tone, showSeparator } =
    useTimelineItem("Timeline.Indicator");
  const { rail, indicator, indicatorLabel, separator } = timelineVariants({
    completed,
    orientation,
    tone,
    variant,
  });
  const tintedContent = useTimelineToken(
    tone === "default" ? "--color-muted-foreground" : TONE_ICON_VAR[tone]
  );
  const solidContent = useTimelineToken("--color-primary-foreground");
  if (orientation === "horizontal") {
    return (
      <View className={rail()}>
        <View
          ref={ref}
          aria-hidden
          className={indicator({
            className: `w-[2px] rounded-none ${completed ? "bg-[var(--panel-primary)]" : "bg-[var(--panel-muted-foreground)]"} ${className ?? ""}`,
          })}
          style={{
            height: `${HORIZONTAL_TICK_HEIGHT * 2}rpx`,
            marginTop: `${-HORIZONTAL_TICK_HEIGHT}rpx`,
          }}
          {...props}
        />
      </View>
    );
  }
  const isDisc = SOLID_VARIANTS.includes(variant);
  const toned = tone !== "default";
  const fill = isDisc ? "solid" : "tinted";
  let nodeClass = PENDING_NODE[fill];
  if (toned) {
    nodeClass = TONE_NODE[tone][fill];
  } else if (completed) {
    nodeClass = TONE_NODE.default.solid;
  }
  const contentColor = !toned && completed ? solidContent : tintedContent;
  let content = children;
  if (variant === "numbered") {
    content = (
      <Text className={indicatorLabel()} style={{ color: contentColor }}>
        {step + 1}
      </Text>
    );
  } else if (variant !== "icon" && variant !== "compact") {
    content = null;
  }
  return (
    <View className={rail()}>
      <IconColorProvider color={contentColor}>
        <View
          ref={ref}
          className={indicator({
            className: `${nodeClass} ${className ?? ""}`,
          })}
          {...props}
        >
          {content}
        </View>
      </IconColorProvider>
      {showSeparator ? <View aria-hidden className={separator()} /> : null}
    </View>
  );
});
TimelineIndicator.displayName = "Timeline.Indicator";
export const TimelineContent = forwardRef<
  ComponentRef<typeof View>,
  TimelineViewProps & {
    className?: string;
  }
>(({ className, children, style, ...props }, ref) => {
  const { variant, orientation } = useTimeline("Timeline.Content");
  const { completed, tone } = useTimelineItem("Timeline.Content");
  const { body, panel } = timelineVariants({
    completed,
    orientation,
    tone,
    variant,
  });
  const horizontal = orientation === "horizontal";
  const inner =
    variant === "card" ? (
      <View className={panel()}>{textChildren(children)}</View>
    ) : (
      children
    );
  if (!horizontal) {
    return (
      <View ref={ref} className={body({ className })} style={style} {...props}>
        {inner}
      </View>
    );
  }
  return (
    <View ref={ref} className={body({ className })} style={style} {...props}>
      {inner}
    </View>
  );
});
TimelineContent.displayName = "Timeline.Content";
export const TimelineHeader = forwardRef<
  ComponentRef<typeof View>,
  TimelineViewProps & {
    className?: string;
  }
>(({ className, ...props }, ref) => {
  const { variant, orientation } = useTimeline("Timeline.Header");
  const { header } = timelineVariants({ orientation, variant });
  return <View ref={ref} className={header({ className })} {...props} />;
});
TimelineHeader.displayName = "Timeline.Header";
export const TimelineHeading = forwardRef<
  ComponentRef<typeof View>,
  TimelineViewProps & {
    className?: string;
  }
>(({ className, ...props }, ref) => {
  const { variant, orientation } = useTimeline("Timeline.Heading");
  const { heading } = timelineVariants({ orientation, variant });
  return <View ref={ref} className={heading({ className })} {...props} />;
});
TimelineHeading.displayName = "Timeline.Heading";
export const TimelineDate = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, style, ...props }, ref) => {
    const { variant, orientation } = useTimeline("Timeline.Date");
    const { date } = timelineVariants({ orientation, variant });
    const ink = useColumnInk("Timeline.Date");
    if (!ink.horizontal) {
      return (
        <Text
          ref={ref}
          className={date({ className })}
          style={style}
          {...props}
        />
      );
    }
    return (
      <Text
        ref={ref}
        className={date({ className })}
        style={mergeStyleAfter(style, ink.style)}
        {...props}
      />
    );
  }
);
TimelineDate.displayName = "Timeline.Date";
export const TimelineLabel = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => {
    const { variant, orientation } = useTimeline("Timeline.Label");
    const { tone } = useTimelineItem("Timeline.Label");
    const { label } = timelineVariants({ orientation, tone, variant });
    return <Text ref={ref} className={label({ className })} {...props} />;
  }
);
TimelineLabel.displayName = "Timeline.Label";
export const TimelineMeta = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, style, ...props }, ref) => {
    const { variant, orientation } = useTimeline("Timeline.Meta");
    const { meta } = timelineVariants({ orientation, variant });
    const ink = useColumnInk("Timeline.Meta");
    if (!ink.horizontal) {
      return (
        <Text
          ref={ref}
          className={meta({ className })}
          style={style}
          {...props}
        />
      );
    }
    return (
      <Text
        ref={ref}
        className={meta({ className })}
        style={mergeStyleAfter(style, ink.style)}
        {...props}
      />
    );
  }
);
TimelineMeta.displayName = "Timeline.Meta";
export const TimelineTitle = forwardRef<ComponentRef<typeof Text>, TextProps>(
  ({ className, ...props }, ref) => {
    const { variant, orientation } = useTimeline("Timeline.Title");
    const { title } = timelineVariants({ orientation, variant });
    return <Text ref={ref} className={title({ className })} {...props} />;
  }
);
TimelineTitle.displayName = "Timeline.Title";
export const TimelineTrailing = forwardRef<
  ComponentRef<typeof Text>,
  TextProps
>(({ className, ...props }, ref) => {
  const { variant, orientation } = useTimeline("Timeline.Trailing");
  const { trailing } = timelineVariants({ orientation, variant });
  return <Text ref={ref} className={trailing({ className })} {...props} />;
});
TimelineTrailing.displayName = "Timeline.Trailing";
export const TimelineDescription = forwardRef<
  ComponentRef<typeof Text>,
  TextProps
>(({ className, style, ...props }, ref) => {
  const { variant, orientation } = useTimeline("Timeline.Description");
  const { content } = timelineVariants({ orientation, variant });
  const ink = useColumnInk("Timeline.Description");
  if (!ink.horizontal) {
    return (
      <Text
        ref={ref}
        className={content({ className })}
        style={style}
        {...props}
      />
    );
  }
  return (
    <Text
      ref={ref}
      className={content({ className })}
      style={mergeStyleAfter(style, ink.style)}
      {...props}
    />
  );
});
TimelineDescription.displayName = "Timeline.Description";
export const TimelineStats = forwardRef<
  ComponentRef<typeof View>,
  TimelineViewProps & {
    className?: string;
  }
>(({ className, ...props }, ref) => {
  const { variant, orientation } = useTimeline("Timeline.Stats");
  const { stats } = timelineVariants({ orientation, variant });
  return <View ref={ref} className={stats({ className })} {...props} />;
});
TimelineStats.displayName = "Timeline.Stats";
export const TimelineStat = forwardRef<
  ComponentRef<typeof View>,
  TimelineStatProps
>(({ className, label, value, ...props }, ref) => {
  const { variant, orientation } = useTimeline("Timeline.Stat");
  const { statLabel, statValue } = timelineVariants({ orientation, variant });
  return (
    <View ref={ref} className={cn("flex flex-col", className)} {...props}>
      <Text className={statLabel()}>{label}</Text>
      <Text className={statValue()}>{value}</Text>
    </View>
  );
});
TimelineStat.displayName = "Timeline.Stat";
export const TimelineMasthead = forwardRef<
  ComponentRef<typeof View>,
  TimelineMastheadProps
>(({ className, media, label, title, children, ...props }, ref) => {
  const { masthead, mastheadMedia, mastheadLabel, mastheadTitle } =
    timelineVariants({
      orientation: "horizontal",
    });
  return (
    <View ref={ref} className={masthead({ className })} {...props}>
      {media ? <View className={mastheadMedia()}>{media}</View> : null}
      {label !== undefined || title !== undefined ? (
        <View className="flex flex-col">
          {label === undefined ? null : (
            <Text className={mastheadLabel()}>{label}</Text>
          )}
          {title === undefined ? null : (
            <Text className={mastheadTitle()}>{title}</Text>
          )}
        </View>
      ) : null}
      {children}
    </View>
  );
});
TimelineMasthead.displayName = "Timeline.Masthead";
