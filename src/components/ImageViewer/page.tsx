import { Image, View } from "@tarojs/components";
import { useState, useSyncExternalStore } from "react";

import { clamp, coverSize, fitWithin, lerp, lerpRect } from "./geometry";
import { viewerUri } from "./trigger";
import type { ViewerItem } from "./types";
import type { useViewerOverlayModel } from "./use-overlay-model";

export const ViewerPage = ({
  model,
  item,
  at,
  cornerRadius,
}: {
  model: ReturnType<typeof useViewerOverlayModel>;
  item: ViewerItem;
  at: number;
  cornerRadius: number;
}) => {
  const f = useSyncExternalStore(
    model.motion.signal.subscribe,
    model.motion.signal.getSnapshot,
    model.motion.signal.getSnapshot
  );
  const fit = fitWithin(item.size ?? model.box, model.box);
  const active = model.activePage.current === at;
  const flies = active && model.origin !== null && !model.reduced;
  const rect = flies && model.origin ? lerpRect(model.origin, fit, f.t) : fit;
  const settled = clamp(f.t, 0, 1);
  const visualScale = active
    ? f.scale * f.shrink * (flies ? 1 : lerp(0.92, 1, settled))
    : 1;
  const corner = flies ? lerp(model.radius, cornerRadius, f.t) : cornerRadius;
  const cover = coverSize(item.size ?? model.box, rect);
  const [fullLoaded, setFullLoaded] = useState(false);
  return (
    <View
      aria-hidden
      style={{
        height: `${model.H * 2}rpx`,
        left: `${model.direction * at * (model.W + 16) * 2}rpx`,
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        width: `${model.W * 2}rpx`,
      }}
    >
      <View
        style={{
          borderRadius: `${(Math.max(0, corner) / Math.max(visualScale, 0.01)) * 2}rpx`,
          height: `${Math.max(rect.height, 1) * 2}rpx`,
          left: `${rect.x * 2}rpx`,
          opacity: !active || flies ? 1 : settled,
          overflow: "hidden",
          position: "absolute",
          top: `${rect.y * 2}rpx`,
          transform: `translateX(${active ? (f.tx + f.dragX) * 2 : 0}rpx) translateY(${active ? (f.ty + f.dragY) * 2 : 0}rpx) scale(${visualScale})`,
          width: `${Math.max(rect.width, 1) * 2}rpx`,
        }}
      >
        <View
          style={{
            height: `${cover.height * 2}rpx`,
            left: `${rect.width - cover.width}rpx`,
            position: "absolute",
            top: `${rect.height - cover.height}rpx`,
            width: `${cover.width * 2}rpx`,
          }}
        >
          <Image
            src={viewerUri(item.source)}
            mode="aspectFill"
            className="absolute inset-0 h-full w-full"
            aria-hidden
          />
          {item.fullSource ? (
            <Image
              src={viewerUri(item.fullSource)}
              mode="aspectFill"
              className="absolute inset-0 h-full w-full"
              aria-hidden
              onLoad={() => setFullLoaded(true)}
              style={{ opacity: fullLoaded ? 1 : 0 }}
            />
          ) : null}
        </View>
      </View>
    </View>
  );
};
