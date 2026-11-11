import { View } from "@tarojs/components";
import { useMemo, useState, useSyncExternalStore } from "react";

import { useDirectionSign } from "../../hooks/use-direction";
import { useElementLayout } from "../../hooks/use-element-layout";
import { mergeStyleAfter } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { AnimatedPressable } from "../../primitives/animated-pressable";
import { useThemeToken } from "../../theme/use-theme";
import {
  SCENE_SCALE,
  SCENE_RADIUS,
  SCENE_DIM,
  HIDDEN_EPSILON,
  EDGE_OPACITY,
  EDGE_WIDTH_PT,
} from "./constants";
import { PanelsideSurfaceContext, usePanelsideContext } from "./context";
import { panelsidePanel, panelsideScene } from "./math";
import type { PanelsidePanelProps, PanelsideSceneProps } from "./types";
import { useSceneWidth } from "./use-scene-width";

export const PanelsidePanel = ({
  className,
  children,
  style,
  ...props
}: PanelsidePanelProps) => {
  const { progress, width, mode, docked } =
    usePanelsideContext("Panelside.Panel");
  const p = useSyncExternalStore(
    progress.subscribe,
    progress.getSnapshot,
    progress.getSnapshot
  );
  const sign = useDirectionSign();
  const [footerHeight, setFooterHeight] = useState(0);
  const surface = useMemo(
    () => ({ footerHeight, setFooterHeight }),
    [footerHeight]
  );
  const geometry = panelsidePanel(p, docked, mode === "overlay", width);
  return (
    <PanelsideSurfaceContext.Provider value={surface}>
      <View
        {...props}
        aria-hidden={geometry.hidden}
        className={cn(
          "flex min-h-0 flex-col bg-[var(--panel-background)]",
          docked
            ? "h-full shrink-0 border-e-[2px] border-solid border-[var(--panel-border)]"
            : "absolute top-0 bottom-0",
          !docked && mode === "overlay" && "z-10 shadow-lg",
          className
        )}
        style={mergeStyleAfter(style, {
          left: !docked && sign === 1 ? 0 : undefined,
          pointerEvents: geometry.hidden ? "none" : "auto",
          right: !docked && sign === -1 ? 0 : undefined,
          transform: `translateX(${geometry.x * sign * 2}rpx)`,
          width: `${width * 2}rpx`,
        })}
      >
        {children}
      </View>
    </PanelsideSurfaceContext.Provider>
  );
};
export const PanelsideScene = ({
  className,
  scale: scaleProp,
  radius: radiusProp,
  dim: dimProp,
  scrimClassName,
  children,
  style,
  ...props
}: PanelsideSceneProps) => {
  const context = usePanelsideContext("Panelside.Scene");
  const {
    progress,
    width,
    mode,
    docked,
    dismissible,
    open,
    setOpen,
    scale: rootScale,
    radius: rootRadius,
    dim: rootDim,
  } = context;
  const p = useSyncExternalStore(
    progress.subscribe,
    progress.getSnapshot,
    progress.getSnapshot
  );
  const scale = scaleProp ?? rootScale ?? SCENE_SCALE;
  const radius = radiusProp ?? rootRadius ?? SCENE_RADIUS;
  const dim = dimProp ?? rootDim ?? SCENE_DIM;
  const scene = useElementLayout(true, children, props.id, false);
  const sceneWidth = useSceneWidth(scene.id, children);
  const sign = useDirectionSign();
  const edge = useThemeToken("border");
  const geometry = panelsideScene(
    p,
    mode === "push" && !docked,
    scale,
    width,
    sceneWidth || scene.layout?.width || 0,
    sign,
    radius
  );
  return (
    <View
      {...props}
      id={props.id ?? scene.id}
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--panel-background)]",
        className
      )}
      style={mergeStyleAfter(style, {
        borderRadius: `${geometry.radius * 2}rpx`,
        transform: `translateX(${geometry.x * 2}rpx) scale(${geometry.scale})`,
      })}
    >
      <View
        aria-hidden={!docked && p > 1 - HIDDEN_EPSILON}
        className="flex min-h-0 flex-1 flex-col"
      >
        {children}
      </View>
      <View
        aria-hidden={!open || docked}
        className={cn(
          "absolute inset-0 flex flex-col bg-black",
          scrimClassName
        )}
        style={{
          opacity: (docked ? 0 : p) * dim,
          pointerEvents: open && !docked ? "auto" : "none",
        }}
      >
        {dismissible ? (
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel="Close navigation panel"
            pressScale={1}
            pressOpacity={1}
            onPress={() => setOpen(false)}
            className="flex-1"
          />
        ) : null}
      </View>
      <View
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          borderColor: edge,
          borderRadius: `${(docked ? 0 : p) * radius * 2}rpx`,
          borderStyle: "solid",
          borderWidth: `${EDGE_WIDTH_PT * 2}rpx`,
          opacity: (docked ? 0 : p) * EDGE_OPACITY,
        }}
      />
    </View>
  );
};
