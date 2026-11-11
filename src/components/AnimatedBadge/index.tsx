import { View } from "@tarojs/components";
import { forwardRef, useId } from "react";
import type { ComponentRef } from "react";

import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { useThemeToken } from "../../theme/use-theme";
import { Text, textChildren, textLabel } from "../primitives/Text";
import { STATUS_COLOR, isStatus } from "./constants";
import { BadgeGlyph, hasBadgeLabel } from "./content";
import { Roll } from "./roll";
import type { AnimatedBadgeProps } from "./types";
import { useBadgeWidth } from "./use-width";
import { animatedBadgeVariants } from "./variants";

export type {
  AnimatedBadgeProps,
  AnimatedBadgeStatus,
  AnimatedBadgeSize,
} from "./types";
export const AnimatedBadge = forwardRef<
  ComponentRef<typeof View>,
  AnimatedBadgeProps
>((props, ref) => {
  const {
    status: statusProp = "neutral",
    size = "md",
    children,
    icon,
    showIcon = true,
    pulse,
    contentKey,
    animateLayout: _animateLayout,
    className,
    labelClassName,
    accessibilityLabel,
    id,
    style,
    ...native
  } = props;
  const reduced = usePanelReducedMotion();
  const status = isStatus(statusProp) ? statusProp : "neutral";
  const slots = animatedBadgeVariants({ size, status });
  const color = useThemeToken(STATUS_COLOR[status]);
  const pulsing = (pulse ?? status === "loading") && !reduced;
  const key =
    contentKey ??
    (typeof children === "string" || typeof children === "number"
      ? children
      : status);
  const generated = useId().replaceAll(":", "");
  const rootId = id ?? `panelui-badge-${generated}`;
  const layout = useBadgeWidth(rootId, props, status, key, reduced);
  return (
    <View
      {...native}
      ref={ref}
      id={rootId}
      aria-role="text"
      aria-label={
        accessibilityLabel ?? props["aria-label"] ?? textLabel(children)
      }
      aria-busy={status === "loading"}
      className={cn(slots.root(), "relative", className)}
      style={mergeStyle(
        layout.width === undefined ? {} : { width: `${layout.width * 2}rpx` },
        style
      )}
    >
      {pulsing ? (
        <View
          aria-hidden
          className={cn(slots.pulse(), "pointer-events-none")}
          style={{ animation: "panel-badge-pulse 1600ms ease-in-out infinite" }}
        />
      ) : null}
      <View
        id={layout.contentId}
        className="flex shrink-0 flex-row items-center"
        style={{ gap: "inherit", width: "max-content" }}
      >
        {showIcon ? (
          <BadgeGlyph
            status={status}
            size={size}
            color={color}
            icon={icon}
            reduced={reduced}
            className={slots.slot()}
          />
        ) : null}
        {hasBadgeLabel(children) ? (
          <View className={cn(slots.slot(), "flex shrink-0")}>
            <Roll contentKey={key} reducedMotion={reduced}>
              {textChildren(children, (text) => (
                <Text className={slots.label({ className: labelClassName })}>
                  {text}
                </Text>
              ))}
            </Roll>
          </View>
        ) : null}
      </View>
    </View>
  );
});
