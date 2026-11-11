import { ScrollView, View } from "@tarojs/components";
import { useMemo } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePresence } from "../../hooks/use-presence";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { FocusRestorePortal } from "../../primitives/portal";
import { textChildren } from "../primitives/Text";
import { ALIGNMENT } from "./constants";
import { SectionRailContext, useSectionRail } from "./context";
import type { SectionRailContentProps } from "./types";

const SectionRailPanel = ({
  className,
  maxWidth = "78%",
  children,
  style,
  ...props
}: SectionRailContentProps) => {
  const { placement } = useSectionRail("SectionRail.Content");
  const reduced = usePanelReducedMotion();
  const metrics = useWindowMetrics();
  const input = useMemo(
    () => ({ children, className, maxWidth, style }),
    [children, className, maxWidth, style]
  );
  const measured = useElementLayout(
    true,
    input,
    props.id ? `${props.id}-content` : undefined,
    false
  );
  const room = Math.max(
    0,
    metrics.height - metrics.insets.top - metrics.insets.bottom - 14
  );
  const contentHeight = measured.layout
    ? `${Math.min(measured.layout.height, room) * 2}rpx`
    : "auto";
  const width =
    typeof maxWidth === "number"
      ? maxWidth
      : (metrics.width * Number(maxWidth.slice(0, -1))) / 100;
  return (
    <View
      {...props}
      role="menu"
      aria-role="menu"
      style={style ?? { maxWidth: `${width * 2}rpx`, minWidth: "368rpx" }}
      className={cn(
        "flex flex-col gap-[4px] rounded-[var(--panel-radius-xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] p-[12px] shadow-lg",
        !reduced &&
          style === undefined &&
          (placement === "right"
            ? "panelui-sectionrail-slide-right"
            : "panelui-sectionrail-slide-left"),
        className
      )}
    >
      <ScrollView
        scrollY
        enhanced
        bounces={false}
        showScrollbar={false}
        style={{ height: contentHeight, maxHeight: `${room * 2}rpx` }}
      >
        <View id={measured.id} className="flex flex-col">
          {textChildren(children)}
        </View>
      </ScrollView>
    </View>
  );
};
export const SectionRailContent = (props: SectionRailContentProps) => {
  const context = useSectionRail("SectionRail.Content");
  const { open, close, placement, align } = context;
  const reduced = usePanelReducedMotion();
  const present = usePresence(open, reduced ? 0 : 120);
  const { insets } = useWindowMetrics();
  useBackHandler(open, close);
  if (!present) {
    return null;
  }
  let motion: string | undefined;
  if (!reduced) {
    motion = open
      ? "panelui-sectionrail-enter"
      : "panelui-sectionrail-exit";
  }
  return (
    <FocusRestorePortal>
      <View
        aria-hidden={!open}
        className={motion}
        style={{
          inset: 0,
          pointerEvents: open ? "auto" : "none",
          position: "fixed",
        }}
      >
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          disabled={!open}
          onPress={close}
          pressScale={1}
          pressOpacity={1}
          style={{ inset: 0, position: "absolute" }}
        />
        <SectionRailContext.Provider value={context}>
          <View
            className={cn(
              "flex flex-col",
              ALIGNMENT[align],
              placement === "right" ? "items-end" : "items-start"
            )}
            style={{
              bottom: `${insets.bottom * 2}rpx`,
              left: `${(insets.left + 12) * 2}rpx`,
              pointerEvents: "none",
              position: "absolute",
              right: `${(insets.right + 12) * 2}rpx`,
              top: `${insets.top * 2}rpx`,
            }}
          >
            <View style={{ pointerEvents: open ? "auto" : "none" }}>
              <SectionRailPanel {...props} />
            </View>
          </View>
        </SectionRailContext.Provider>
      </View>
    </FocusRestorePortal>
  );
};
