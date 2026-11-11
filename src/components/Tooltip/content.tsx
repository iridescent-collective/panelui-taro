import { ScrollView, View } from "@tarojs/components";
import { useEffect } from "react";
import type { ReactNode } from "react";

import { usePresence } from "../../hooks/use-presence";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { Portal } from "../../primitives/portal";
import { TooltipContext, useTooltip } from "./context";
import { wrapTooltipText } from "./text";
import type { TooltipContentProps } from "./types";
import { useLabelMotion } from "./use-label-motion";
import { useLabelPosition } from "./use-label-position";
import { tooltipVariants } from "./variants";

const TooltipBody = ({
  scrollable,
  cap,
  children,
}: {
  scrollable: boolean;
  cap: number;
  children?: ReactNode;
}) =>
  scrollable ? (
    <ScrollView
      scrollY
      enhanced
      bounces={false}
      showScrollbar={false}
      className="min-h-0 shrink"
      style={{ maxHeight: `${Math.max(0, cap - 12) * 2}rpx` }}
    >
      {wrapTooltipText(children)}
    </ScrollView>
  ) : (
    wrapTooltipText(children)
  );
const TooltipLayer = (props: TooltipContentProps) => {
  const {
    className,
    placement = "top",
    align: _align,
    offset: _offset,
    alignOffset: _alignOffset,
    width: _width,
    minWidth: _minWidth,
    maxHeight: _maxHeight,
    scrollable = false,
    variant = "inverted",
    style,
    onLayout: _onLayout,
    children,
    ...rest
  } = props;
  const context = useTooltip("Tooltip.Content");
  const panel = useLabelPosition(props);
  const motion = useLabelMotion(
    context.open,
    panel.placed,
    panel.position?.placement ?? placement
  );
  const slots = tooltipVariants({ variant });
  return (
    <View className="fixed inset-0">
      <View
        aria-label="Dismiss"
        className="absolute inset-0"
        onClick={context.hide}
      />
      <View id={panel.id} style={panel.style}>
        <View
          {...rest}
          role="tooltip"
          aria-role="tooltip"
          className={cn(
            "relative flex min-h-0 flex-col",
            slots.content(),
            scrollable && "overflow-hidden",
            className
          )}
          style={mergeStyle(
            { maxHeight: `${panel.cap * 2}rpx`, ...motion },
            style
          )}
        >
          <TooltipBody scrollable={scrollable} cap={panel.cap}>
            {children}
          </TooltipBody>
        </View>
      </View>
    </View>
  );
};
export const TooltipContent = (props: TooltipContentProps) => {
  const context = useTooltip("Tooltip.Content");
  const variant = props.variant ?? "inverted";
  useEffect(() => context.setVariant(variant), [variant, context.setVariant]);
  const present = usePresence(context.open, 100);
  if (!present || !context.trigger) {
    return null;
  }
  return (
    <Portal>
      <TooltipContext.Provider value={context}>
        <TooltipLayer {...props} />
      </TooltipContext.Provider>
    </Portal>
  );
};
