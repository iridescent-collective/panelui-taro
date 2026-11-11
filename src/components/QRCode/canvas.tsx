import { Image, View } from "@tarojs/components";
import { forwardRef, useMemo } from "react";
import type { ComponentRef } from "react";

import { mergeStyle } from "../../lib/styles";
import { cn } from "../../lib/utils";
import { CANVAS_SIZE, MODULE, PLATE } from "./constants";
import { useQRCode } from "./context";
import { qrPaths } from "./geometry";
import { qrImageSource } from "./svg-source";
import type { QRCodeCanvasProps } from "./types";

export const QRCodeCanvas = forwardRef<
  ComponentRef<typeof View>,
  QRCodeCanvasProps
>(
  (
    {
      className,
      pixelSize,
      color,
      backgroundColor,
      moduleShape = "square",
      eyeFrameShape = "square",
      eyeBallShape = "square",
      eyeFrameColor,
      eyeBallColor,
      style,
      ...props
    },
    ref
  ) => {
    const { matrix, error, value, size, logoFraction } =
      useQRCode("QRCode.Canvas");
    const side = pixelSize ?? CANVAS_SIZE[size];
    const dark = color ?? MODULE;
    const light = backgroundColor ?? PLATE;
    const frameInk = eyeFrameColor ?? dark;
    const ballInk = eyeBallColor ?? frameInk;
    const source = useMemo(
      () =>
        matrix
          ? qrImageSource(
              matrix.size,
              qrPaths(
                matrix,
                logoFraction,
                moduleShape,
                eyeFrameShape,
                eyeBallShape
              ),
              light,
              dark,
              frameInk,
              ballInk
            )
          : null,
      [
        matrix,
        logoFraction,
        moduleShape,
        eyeFrameShape,
        eyeBallShape,
        light,
        dark,
        frameInk,
        ballInk,
      ]
    );
    if (!matrix && !error) {
      return null;
    }
    return (
      <View
        {...props}
        ref={ref}
        role="img"
        aria-role="image"
        aria-label={
          error ? "QR code could not be generated" : `QR code for ${value}`
        }
        className={cn(
          error &&
            "flex items-center justify-center rounded-lg bg-[var(--panel-muted)]",
          className
        )}
        style={mergeStyle(
          { height: `${side * 2}rpx`, width: `${side * 2}rpx` },
          style
        )}
      >
        {source && (
          <Image
            src={source}
            mode="scaleToFill"
            aria-hidden
            style={{ display: "block", height: "100%", width: "100%" }}
          />
        )}
      </View>
    );
  }
);
