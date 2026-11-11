import { Canvas, View } from "@tarojs/components";
import { forwardRef } from "react";

import { cn } from "../../lib/utils";
import { AvatarCropperCanvas } from "./canvas";
import { CropperContext } from "./context";
import type { AvatarCropperHandle, AvatarCropperProps } from "./types";
import { useAvatarCropperModel } from "./use-model";

export const AvatarCropperRoot = forwardRef<
  AvatarCropperHandle,
  AvatarCropperProps
>(
  (
    {
      source,
      shape,
      maxZoom,
      cover,
      minZoom,
      background,
      inset,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { context, exportId } = useAvatarCropperModel(
      { background, cover, inset, maxZoom, minZoom, shape, source },
      ref
    );
    return (
      <CropperContext.Provider value={context}>
        <View
          {...props}
          className={cn("flex min-h-0 flex-1 flex-col", className)}
        >
          {children ?? <AvatarCropperCanvas />}
          <Canvas
            id={exportId}
            canvasId={exportId}
            type="2d"
            aria-hidden
            style={{
              height: "2rpx",
              left: "-20000rpx",
              pointerEvents: "none",
              position: "absolute",
              top: 0,
              width: "2rpx",
            }}
          />
        </View>
      </CropperContext.Provider>
    );
  }
);
AvatarCropperRoot.displayName = "AvatarCropper";
