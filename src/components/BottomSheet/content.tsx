import { View } from "@tarojs/components";
import { useState } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { useElementLayout } from "../../hooks/use-element-layout";
import { usePresence } from "../../hooks/use-presence";
import { usePanelReducedMotion } from "../../hooks/use-reduced-motion";
import { useWindowMetrics } from "../../hooks/use-window-metrics";
import { XIcon } from "../../icons";
import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { ModalPortal } from "../../primitives/portal";
import { Scrim } from "../../primitives/scrim";
import { useThemeToken } from "../../theme/use-theme";
import { textChildren } from "../primitives/Text";
import {
  BottomSheetContext,
  SheetSizedContext,
  SheetSurfaceContext,
  useBottomSheet,
} from "./context";
import { sheetGeometry } from "./geometry";
import { SheetSurfaceStore } from "./surface-store";
import type { BottomSheetContentProps } from "./types";
import { useSheetDrag } from "./use-sheet-drag";
import {
  SHEET_ENTER_DURATION,
  SHEET_EXIT_DURATION,
  SHEET_FADE_DURATION,
  useSheetMotion,
} from "./use-sheet-motion";
import { sheetVariants } from "./variants";

const SheetLayer = ({
  dismissible = true,
  showClose = true,
  showGrabber = true,
  detached = false,
  blur = false,
  size = "auto",
  className,
  children,
  style,
  id,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  ...props
}: BottomSheetContentProps) => {
  const { open, setOpen } = useBottomSheet("BottomSheet.Content");
  const reduced = usePanelReducedMotion();
  const window = useWindowMetrics();
  const geometry = sheetGeometry(
    window.height,
    window.insets,
    window.platform,
    detached,
    size
  );
  const motion = useSheetMotion(open, window.height, reduced);
  const [surface] = useState(() => new SheetSurfaceStore());
  const layout = useElementLayout(false, undefined, id);
  const close = () => setOpen(false);
  const drag = useSheetDrag({
    close,
    dismissible,
    gap: geometry.gap,
    height: window.height,
    measure: layout.refresh,
    open,
    scale: window.scale,
    setDragging: motion.setDragging,
    setTranslation: motion.setTranslation,
    surface,
    translation: motion.translation,
  });
  const tint = useThemeToken("muted-foreground");
  useBackHandler(open && dismissible, close);
  const duration = open ? SHEET_ENTER_DURATION : SHEET_EXIT_DURATION;
  const backdropDuration = reduced ? SHEET_FADE_DURATION : duration;
  const opacity = reduced
    ? Number(motion.visible)
    : Math.max(0, Math.min(1, 1 - motion.translation / window.height));
  return (
    <View
      className="fixed inset-0 z-[1000] flex flex-col justify-end"
      catchMove
    >
      <View
        className="absolute inset-0"
        style={{
          opacity,
          transition: motion.dragging
            ? "none"
            : `opacity ${backdropDuration}ms cubic-bezier(0.32,0.72,0,1)`,
        }}
      >
        <Scrim blur={blur} />
        <View
          className="absolute inset-0"
          aria-label="Close sheet"
          aria-disabled={!dismissible || !open}
          onClick={() => {
            if (dismissible && open) {
              close();
            }
          }}
        />
      </View>
      <View
        {...props}
        id={layout.id}
        role="dialog"
        aria-role="dialog"
        aria-modal
        aria-hidden={!open}
        className={cn(
          "relative flex min-h-0 flex-col",
          sheetVariants({ className, detached })
        )}
        style={mergeStyle(
          {
            height:
              geometry.height === undefined
                ? undefined
                : `${geometry.height * 2}rpx`,
            marginBottom: `${geometry.gap * 2}rpx`,
            maxHeight: `${geometry.cap * 2}rpx`,
            opacity: reduced ? Number(motion.visible) : 1,
            paddingBottom: `${geometry.paddingBottom * 2}rpx`,
            transform: reduced
              ? "translateY(0)"
              : `translateY(${motion.translation * 2}rpx)`,
            transition: reduced
              ? `opacity ${SHEET_FADE_DURATION}ms ease`
              : motion.transition,
          },
          style
        )}
        onTouchStart={(event) => {
          drag.onTouchStart(event);
          onTouchStart?.(event);
        }}
        onTouchMove={(event) => {
          drag.onTouchMove(event);
          onTouchMove?.(event);
        }}
        onTouchEnd={async (event) => {
          await drag.onTouchEnd();
          onTouchEnd?.(event);
        }}
        onTouchCancel={async (event) => {
          await drag.onTouchCancel();
          onTouchCancel?.(event);
        }}
      >
        <SheetSurfaceContext.Provider value={surface}>
          <SheetSizedContext.Provider value={geometry.height !== undefined}>
            {showGrabber ? (
              <View aria-hidden className="mb-[24px] self-center">
                <View className="h-[8px] w-[80px] rounded-full bg-[var(--panel-muted-foreground-opacity-30)]" />
              </View>
            ) : null}
            {textChildren(children)}
            {showClose ? (
              <AnimatedPressable
                accessibilityRole="button"
                accessibilityLabel="Close"
                onPress={close}
                hitSlop={8}
                className="absolute end-[32px] top-[24px] z-10 flex h-[64px] w-[64px] flex-col items-center justify-center rounded-full bg-[var(--panel-muted)]"
                pressScale={1}
                pressOpacity={0.7}
              >
                <XIcon size={16} color={tint} />
              </AnimatedPressable>
            ) : null}
          </SheetSizedContext.Provider>
        </SheetSurfaceContext.Provider>
      </View>
    </View>
  );
};
export const BottomSheetContent = (props: BottomSheetContentProps) => {
  const context = useBottomSheet("BottomSheet.Content");
  const reduced = usePanelReducedMotion();
  const present = usePresence(
    context.open,
    reduced ? SHEET_FADE_DURATION : SHEET_EXIT_DURATION
  );
  return present ? (
    <ModalPortal interactive={context.open}>
      <BottomSheetContext.Provider value={context}>
        <SheetLayer {...props} />
      </BottomSheetContext.Provider>
    </ModalPortal>
  ) : null;
};
