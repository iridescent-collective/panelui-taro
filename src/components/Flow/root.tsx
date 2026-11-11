import { View } from "@tarojs/components";
import { useMemo, useSyncExternalStore } from "react";

import { cn } from "../../lib/utils";
import { FlowContext, useFlow } from "./context";
import { FlowGraphics } from "./graphics";
import type { FlowProps } from "./types";
import { useFlowCamera } from "./use-camera";
import { useFlowModel } from "./use-model";
import { splitChildren } from "./utils";
import { flowVariants } from "./variants";

const GraphLayer = ({ children }: { children?: FlowProps["children"] }) => {
  const { translateX, translateY, zoom, layer, origin } = useFlow("Flow");
  const x = useSyncExternalStore(
    translateX.subscribe,
    translateX.getSnapshot,
    translateX.getSnapshot
  );
  const y = useSyncExternalStore(
    translateY.subscribe,
    translateY.getSnapshot,
    translateY.getSnapshot
  );
  const scale = useSyncExternalStore(
    zoom.subscribe,
    zoom.getSnapshot,
    zoom.getSnapshot
  );
  return (
    <View
      className="absolute"
      style={{
        height: `${layer.height * 2}rpx`,
        left: `${-origin.x * 2}rpx`,
        top: `${-origin.y * 2}rpx`,
        transform: `translateX(${x * 2}rpx) translateY(${y * 2}rpx) scale(${scale})`,
        transformOrigin: `${origin.x * 2}rpx ${origin.y * 2}rpx`,
        width: `${layer.width * 2}rpx`,
      }}
    >
      {children}
    </View>
  );
};
export const FlowRoot = ({
  className,
  children,
  panOnDrag = true,
  zoomOnPinch = true,
  defaultViewport,
  minZoom,
  maxZoom,
  fitViewOnMount,
  fitViewPadding,
  onViewportChange,
  onNodeDragEnd,
  onConnect,
  isValidConnection,
  ...props
}: FlowProps) => {
  const model = useFlowModel({
    ...props,
    children,
    defaultViewport,
    fitViewOnMount,
    fitViewPadding,
    isValidConnection,
    maxZoom,
    minZoom,
    onConnect,
    onNodeDragEnd,
    onViewportChange,
  });
  const { context } = model;
  const camera = useFlowCamera({
    left: model.layout?.left ?? 0,
    locked: context.locked,
    max: context.maxZoom,
    min: context.minZoom,
    pan: panOnDrag,
    pinch: zoomOnPinch,
    read: () => ({
      x: context.translateX.value,
      y: context.translateY.value,
      zoom: context.zoom.value,
    }),
    report: model.reportViewport,
    top: model.layout?.top ?? 0,
    write: model.immediate,
  });
  const parts = useMemo(() => splitChildren(children), [children]);
  return (
    <View
      {...props}
      id={props.id ?? model.id}
      className={cn(
        "relative flex min-h-0 flex-col",
        flowVariants().root({ className })
      )}
      catchMove={!context.locked && (panOnDrag || zoomOnPinch)}
      onTouchStart={camera.onTouchStart}
      onTouchMove={camera.onTouchMove}
      onTouchEnd={camera.onTouchEnd}
      onTouchCancel={camera.onTouchCancel}
    >
      <FlowContext.Provider value={context}>
        <GraphLayer>
          {parts.background}
          <FlowGraphics />
          {parts.canvas}
        </GraphLayer>
        {parts.overlay}
      </FlowContext.Provider>
    </View>
  );
};
