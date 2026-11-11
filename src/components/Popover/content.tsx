import { ScrollView, View } from "@tarojs/components";
import type { CSSProperties } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePresence } from "../../hooks/use-presence";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { FocusRestorePortal, ModalPortal } from "../../primitives/portal";
import { Scrim } from "../../primitives/scrim";
import { BottomSheet } from "../BottomSheet";
import { textChildren } from "../primitives/Text";
import { PopoverContext, usePopover } from "./context";
import type { PopoverContentProps } from "./types";
import { usePopoverMotion } from "./use-motion";
import { usePanelPosition } from "./use-panel-position";

const EXIT_DURATION = 120;
const PopoverBody = ({
  scrollable,
  unstyled,
  cap,
  measured,
  children,
}: Pick<PopoverContentProps, "scrollable" | "unstyled" | "children"> & {
  cap: number;
  measured: ReturnType<typeof useElementLayout>;
}) => {
  if (!scrollable) {
    return textChildren(children);
  }
  const maximum = Math.max(0, cap - (unstyled ? 0 : 32));
  const height = Math.min(maximum, measured.layout?.height ?? maximum);
  return (
    <ScrollView
      scrollY
      enhanced
      bounces={false}
      showScrollbar={false}
      className="relative min-h-0 shrink"
      style={{ height: `${height * 2}rpx`, maxHeight: `${maximum * 2}rpx` }}
    >
      <View id={measured.id} className="flex flex-col gap-[12px]">
        {textChildren(children)}
      </View>
    </ScrollView>
  );
};
const popoverPositionStyle = (
  panel: ReturnType<typeof usePanelPosition>
): CSSProperties => ({
  left: `${(panel.position?.left ?? -9999) * 2}rpx`,
  maxHeight: `${panel.cap * 2}rpx`,
  maxWidth: `${panel.available * 2}rpx`,
  minWidth: panel.floor === undefined ? undefined : `${panel.floor * 2}rpx`,
  position: "absolute",
  top: `${(panel.position?.top ?? -9999) * 2}rpx`,
  width: panel.width === undefined ? undefined : `${panel.width * 2}rpx`,
});
const popoverRoles = (props: PopoverContentProps) => ({
  "aria-role":
    props["aria-role"] ??
    props.role ??
    props.accessibilityRole ??
    props.ariaRole ??
    "dialog",
  role:
    props.role ??
    props["aria-role"] ??
    props.accessibilityRole ??
    props.ariaRole ??
    "dialog",
});
const PopoverLayer = (props: PopoverContentProps) => {
  const {
    className,
    modal = false,
    dismissLabel = "Close",
    dismissible = true,
    blur = false,
    scrim = false,
    scrimClassName = "bg-black/30",
    overshootClamping = false,
    scrollable = false,
    unstyled = false,
    background,
    children,
    style,
    placement = "bottom",
    align: _align,
    offset: _offset,
    alignOffset: _alignOffset,
    width: _width,
    minWidth: _minWidth,
    maxHeight: _maxHeight,
    onLayout: _onLayout,
    ...rest
  } = props;
  const { open, setOpen } = usePopover("Popover.Content");
  const body = useElementLayout(Boolean(scrollable), children);
  // A scroll view initially uses its height cap. Measure its contents first so
  // the panel cannot enter at a temporary, screen-height clamped position.
  const panel = usePanelPosition(props, !scrollable || body.layout !== null);
  const placed = Boolean(panel.position);
  const motion = usePopoverMotion(
    open,
    placed,
    panel.position?.placement ?? placement,
    overshootClamping
  );
  useBackHandler(open && dismissible, () => setOpen(false));
  return (
    <View className="fixed inset-0 z-[1000]">
      {blur || scrim ? (
        <Scrim blur={blur} intensity={20} dimClassName={scrimClassName} />
      ) : null}
      <View
        className="absolute inset-0"
        aria-label={dismissLabel || undefined}
        aria-hidden={dismissLabel === false}
        aria-disabled={!dismissible || !open}
        onClick={() => {
          if (dismissible && open) {
            setOpen(false);
          }
        }}
      />
      <View id={panel.id} style={popoverPositionStyle(panel)}>
        <View
          {...rest}
          {...popoverRoles(rest)}
          aria-modal={modal}
          aria-hidden={!open || !placed}
          className={cn(
            "relative flex min-h-0 flex-col",
            unstyled
              ? "overflow-hidden rounded-[var(--panel-radius-2xl)]"
              : "rounded-[var(--panel-radius-2xl)] border-[2px] border-solid border-[var(--panel-border)] bg-[var(--panel-popover)] p-[32px] shadow-lg",
            scrollable ? "overflow-hidden" : "gap-[12px]",
            className
          )}
          style={mergeStyle(
            {
              maxHeight: `${panel.cap * 2}rpx`,
              ...motion,
            },
            style
          )}
        >
          {background}
          <PopoverBody
            scrollable={scrollable}
            unstyled={unstyled}
            cap={panel.cap}
            measured={body}
          >
            {children}
          </PopoverBody>
        </View>
      </View>
    </View>
  );
};
const SheetPresentation = ({
  className,
  children,
  width = "content-fit",
  minWidth,
  dismissible = true,
  style,
  id,
  placement: _placement,
  align: _align,
  offset: _offset,
  alignOffset: _alignOffset,
  maxHeight: _maxHeight,
  overshootClamping: _overshootClamping,
  scrollable: _scrollable,
  unstyled: _unstyled,
  background: _background,
  blur: _blur,
  scrim: _scrim,
  scrimClassName: _scrimClassName,
  onLayout: _onLayout,
  modal: _modal,
  dismissLabel: _dismissLabel,
  ...rest
}: PopoverContentProps) => {
  const context = usePopover("Popover.Content");
  let panelWidth: string | undefined;
  if (width === "full" || width === "trigger") {
    panelWidth = "100%";
  }
  if (typeof width === "number") {
    panelWidth = `${width * 2}rpx`;
  }
  return (
    <BottomSheet open={context.open} onOpenChange={context.setOpen}>
      <BottomSheet.Content dismissible={dismissible}>
        <PopoverContext.Provider value={context}>
          <View
            {...rest}
            id={id}
            className={cn(
              "flex flex-col",
              width === "content-fit" && "self-center",
              className
            )}
            style={mergeStyle(
              {
                minWidth:
                  minWidth === undefined ? undefined : `${minWidth * 2}rpx`,
                paddingTop: "48rpx",
                width: panelWidth,
              },
              style
            )}
          >
            {textChildren(children)}
          </View>
        </PopoverContext.Provider>
      </BottomSheet.Content>
    </BottomSheet>
  );
};
export const PopoverContent = (props: PopoverContentProps) => {
  const context = usePopover("Popover.Content");
  const present = usePresence(context.open, EXIT_DURATION);
  if (context.presentation === "bottom-sheet") {
    return <SheetPresentation {...props} />;
  }
  if (!present || !context.trigger) {
    return null;
  }
  const LayerPortal = props.modal ? ModalPortal : FocusRestorePortal;
  return (
    <LayerPortal interactive={context.open}>
      <PopoverContext.Provider value={context}>
        <PopoverLayer {...props} />
      </PopoverContext.Provider>
    </LayerPortal>
  );
};
