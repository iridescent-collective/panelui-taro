import { View } from "@tarojs/components";
import { useMemo } from "react";

import { useBackHandler } from "../../hooks/use-back-handler";
import { DirectionContext, useDirection } from "../../hooks/use-direction";
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
import { DRAWER_EXIT_DURATION } from "./constants";
import { DrawerContext, DrawerSurfaceContext, useDrawer } from "./context";
import { drawerGeometry } from "./math";
import type { DrawerContentProps } from "./types";
import { useDrawerMotion } from "./use-motion";
import { useDrawerPan } from "./use-pan";
import { panelVariants } from "./variants";

const drawerPositionStyle = (
  horizontal: boolean,
  physical: string,
  extent: number
) =>
  horizontal
    ? {
        bottom: 0,
        height: "100%",
        left: physical === "left" ? 0 : "auto",
        right: physical === "right" ? 0 : "auto",
        top: 0,
        width: `${extent * 2}rpx`,
      }
    : {
        bottom: physical === "bottom" ? 0 : "auto",
        height: `${extent * 2}rpx`,
        left: 0,
        right: 0,
        top: physical === "top" ? 0 : "auto",
        width: "100%",
      };

const drawerPadding = (side: string, top: number, bottom: number) => ({
  paddingBottom: side === "top" ? 16 : Math.max(bottom, 16),
  paddingTop: side === "bottom" ? 16 : top + 16,
});

const DrawerLayer = ({
  className,
  unstyled = false,
  overlayClassName,
  exitDuration: _exitDuration,
  side = "start",
  size = "md",
  dismissible = true,
  swipeToDismiss = true,
  showClose = true,
  closeSide,
  blur = false,
  children,
  style,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onTouchCancel,
  ...props
}: DrawerContentProps) => {
  const context = useDrawer("Drawer.Content");
  const { open, setOpen } = context;
  const window = useWindowMetrics();
  const direction = useDirection();
  const reduced = usePanelReducedMotion();
  const { extent, horizontal, outward, physical } = drawerGeometry(
    window.width,
    window.height,
    side,
    size,
    direction
  );
  const close = () => setOpen(false);
  const motion = useDrawerMotion(open, extent, reduced);
  const pan = useDrawerPan({
    begin: motion.begin,
    close,
    enabled: swipeToDismiss,
    extent,
    horizontal,
    open,
    outward,
    restore: motion.restore,
    scale: window.scale,
    update: motion.update,
  });
  const closeCorner = closeSide ?? (side === "end" ? "start" : "end");
  const surface = useMemo(
    () => ({ closeSide: closeCorner, showClose }),
    [closeCorner, showClose]
  );
  const { paddingTop, paddingBottom } = drawerPadding(
    side,
    window.insets.top,
    window.insets.bottom
  );
  const tint = useThemeToken("muted-foreground");
  useBackHandler(open, close);
  return (
    <View className="fixed inset-0 z-[1000]" style={{ direction }}>
      <View
        className="absolute inset-0"
        style={unstyled ? undefined : { opacity: motion.opacity }}
      >
        <Scrim
          blur={blur}
          data-state={open ? "open" : "closed"}
          className={overlayClassName}
        />
        <View
          className="absolute inset-0"
          aria-label="Close drawer"
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
        data-state={open ? "open" : "closed"}
        role="dialog"
        aria-role="dialog"
        aria-modal
        aria-hidden={!open}
        catchMove={pan.active}
        className={cn(
          !unstyled && "panel-drawer-surface flex min-h-0 flex-col",
          unstyled ? className : panelVariants({ className, side })
        )}
        style={
          unstyled
            ? style
            : mergeStyle(
                {
                  ...drawerPositionStyle(horizontal, physical, extent),
                  paddingBottom: `${paddingBottom * 2}rpx`,
                  paddingTop: `${paddingTop * 2}rpx`,
                  transform: `translate${horizontal ? "X" : "Y"}(${motion.shift * outward * 2}rpx)`,
                },
                style
              )
        }
        onTouchStart={(event) => {
          pan.onTouchStart(event);
          onTouchStart?.(event);
        }}
        onTouchMove={(event) => {
          pan.onTouchMove(event);
          onTouchMove?.(event);
        }}
        onTouchEnd={(event) => {
          pan.onTouchEnd(event);
          onTouchEnd?.(event);
        }}
        onTouchCancel={(event) => {
          pan.onTouchCancel();
          onTouchCancel?.(event);
        }}
      >
        <DrawerSurfaceContext.Provider value={surface}>
          {textChildren(children)}
          {showClose ? (
            <AnimatedPressable
              accessibilityRole="button"
              accessibilityLabel="Close"
              onPress={close}
              hitSlop={8}
              pressScale={1}
              pressOpacity={0.7}
              className={cn(
                "absolute z-10 flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[var(--panel-muted)]",
                closeCorner === "start" ? "start-[32px]" : "end-[32px]"
              )}
              style={{ top: `${paddingTop * 2}rpx` }}
            >
              <XIcon size={16} color={tint} />
            </AnimatedPressable>
          ) : null}
        </DrawerSurfaceContext.Provider>
      </View>
    </View>
  );
};
export const DrawerContent = (props: DrawerContentProps) => {
  const context = useDrawer("Drawer.Content");
  const direction = useDirection();
  const present = usePresence(
    context.open,
    props.exitDuration ?? DRAWER_EXIT_DURATION
  );
  return present ? (
    <ModalPortal interactive={props.unstyled ? context.open : undefined}>
      <DrawerContext.Provider value={context}>
        <DirectionContext.Provider value={direction}>
          <DrawerLayer {...props} />
        </DirectionContext.Provider>
      </DrawerContext.Provider>
    </ModalPortal>
  ) : null;
};
