import { View } from "@tarojs/components";
import { forwardRef, useMemo } from "react";
import type { ComponentRef } from "react";

import { cn } from "../../lib/utils";
import { Popover } from "../Popover";
import { QRCodeCanvas } from "./canvas";
import { LOGO_FRACTION } from "./constants";
import { QRCodeContext } from "./context";
import { encodeWithLogo } from "./encode-with-logo";
import {
  hasLogo,
  QRCodeAction,
  QRCodeCaption,
  QRCodeContent,
  QRCodeDescription,
  QRCodeFrame,
  QRCodeHeader,
  QRCodeLogo,
  QRCodePanel,
  QRCodeTitle,
  QRCodeTrigger,
  QRCodeValue,
} from "./parts";
import type { QRCodeProps } from "./types";
import { qrCodeVariants } from "./variants";

export type { ErrorCorrectionLevel } from "./qr-encode";
export type {
  QRCodeModuleShape,
  QRCodeEyeFrameShape,
  QRCodeEyeBallShape,
} from "./qr-shapes";
export type {
  QRCodeSize,
  QRCodePresentation,
  QRCodeProps,
  QRCodeCanvasProps,
  QRCodeFrameProps,
  QRCodeHeaderProps,
  QRCodeTitleProps,
  QRCodeActionProps,
  QRCodePanelProps,
  QRCodeDescriptionProps,
  QRCodeCaptionProps,
  QRCodeValueProps,
  QRCodeLogoProps,
  QRCodeTriggerProps,
  QRCodeContentProps,
} from "./types";

const QRCodeRoot = forwardRef<ComponentRef<typeof View>, QRCodeProps>(
  (
    {
      className,
      value,
      errorCorrection = "M",
      version,
      size = "md",
      presentation = "inline",
      open,
      onOpenChange,
      children,
      ...props
    },
    ref
  ) => {
    const slots = qrCodeVariants({ size });
    const logoFraction = hasLogo(children) ? LOGO_FRACTION : 0;
    const { matrix, error: encodingError } = useMemo(() => {
      try {
        return {
          error: null,
          matrix: encodeWithLogo(value, errorCorrection, version, logoFraction),
        };
      } catch (error) {
        return {
          error: error instanceof Error ? error.message : String(error),
          matrix: null,
        };
      }
    }, [value, errorCorrection, version, logoFraction]);
    const context = {
      error: encodingError,
      logoFraction,
      matrix,
      size,
      slots,
      value,
    };
    return (
      <QRCodeContext.Provider value={context}>
        {presentation === "inline" ? (
          <View
            {...props}
            ref={ref}
            className={cn("flex flex-col", slots.root({ className }))}
          >
            {children}
          </View>
        ) : (
          <Popover
            open={open}
            onOpenChange={onOpenChange}
            presentation={presentation}
          >
            {children}
          </Popover>
        )}
      </QRCodeContext.Provider>
    );
  }
);
export const QRCode = Object.assign(QRCodeRoot, {
  Action: QRCodeAction,
  Canvas: QRCodeCanvas,
  Caption: QRCodeCaption,
  Content: QRCodeContent,
  Description: QRCodeDescription,
  Frame: QRCodeFrame,
  Header: QRCodeHeader,
  Logo: QRCodeLogo,
  Panel: QRCodePanel,
  Title: QRCodeTitle,
  Trigger: QRCodeTrigger,
  Value: QRCodeValue,
});
